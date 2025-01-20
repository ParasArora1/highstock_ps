import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";

// Define interfaces for the data types
interface User {
  id: number;
  name: string;
  age: number;
  gender: string;
  coins: number;
}

interface PizzaSlice {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface CartItem {
  slice: PizzaSlice;
  quantity: number;
}

interface UserPizzaHistory {
  id: number;
  slice_id: number;
  slice_name: string;
  purchased_at: string;
  eaten_at: string | null;
}

const API_URL = "https://highstock-ps-1.onrender.com";

const ManagePlayers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pizzaSlices, setPizzaSlices] = useState<PizzaSlice[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [history, setHistory] = useState<UserPizzaHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // Fetch users and pizza slices when the component mounts
  useEffect(() => {
    fetchUsers();
    fetchPizzaSlices();

    const pollInterval = setInterval(() => {
      fetchUsers();
    }, 5000);

    return () => clearInterval(pollInterval);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPizzaSlices = async () => {
    try {
      const response = await fetch(`${API_URL}/pizza_slices`);
      const data = await response.json();
      setPizzaSlices(data);
    } catch (error) {
      console.error("Error fetching pizza slices:", error);
    }
  };

  const fetchUserHistory = async (userId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/user_history/${userId}`);
      const data = await response.json();
      setHistory(data);
      setShowHistoryModal(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShowPopup(true);
      setPopupMessage("Failed to fetch history.");
      console.error("Error fetching user history:", error);
    }
  };

  const handleAddToCart = (slice: PizzaSlice) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.slice.id === slice.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.slice.id === slice.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { slice, quantity: 1 }];
    });
  };

  const logPizzaAsEaten = async (id_of_slice: number) => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/log_pizza`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id_of_slice,
          user_id: selectedUser.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to log pizza slice.");

      await fetchUserHistory(selectedUser.id);
      setPopupMessage("Pizza slice logged as eaten!");
      setShowPopup(true);
    } catch (error) {
      console.error("Error logging pizza slice:", error);
      setPopupMessage("Failed to log pizza slice.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = (sliceId: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.slice.id === sliceId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirmation(true);
  };

  const handlePurchase = async () => {
    if (!selectedUser) return;

    const totalCost = cart.reduce(
      (sum, item) => sum + item.slice.price * item.quantity,
      0
    );

    if (selectedUser.coins < totalCost) {
      setPopupMessage("Not enough coins to complete the purchase.");
      setShowPopup(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/buy_pizza`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          items: cart.map((item) => ({
            slice_id: item.slice.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to purchase pizzas.");

      await fetchUsers();
      setShowPurchaseModal(false);
      setCart([]);
      setPopupMessage("Purchase completed successfully.");
      setShowPopup(true);
    } catch (error) {
      console.error("Error purchasing pizzas:", error);
      setPopupMessage("Failed to complete the purchase.");
      setShowPopup(true);
    }
  };

  const totalCost = cart.reduce(
    (sum, item) => sum + item.slice.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="container mx-auto p-8 relative">
        <motion.h1
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-extrabold mb-12 text-center bg-gradient-to-r from-purple-500 via-red-500 to-yellow-500 bg-clip-text text-transparent"
        >
          Pizza Paradise
        </motion.h1>

        <div className="grid gap-6">
          <AnimatePresence>
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-purple-500 p-6 rounded-xl shadow-lg bg-gradient-to-r from-gray-900 to-black hover:shadow-purple-500/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="min-w-[200px]">
                    <h2 className="text-2xl font-bold text-purple-400 break-words">{user.name}</h2>
                    <p className="text-gray-400">Age: {user.age} | Gender: {user.gender}</p>
                    <p className="text-yellow-500 font-semibold">🪙 {user.coins} coins</p>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedUser(user);
                        setShowPurchaseModal(true);
                        setShowHistoryModal(false);
                      }}
                      className="bg-gradient-to-r from-purple-500 to-red-500 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                    >
                      🍕 Buy Pizza
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedUser(user);
                        fetchUserHistory(user.id);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-300"
                    >
                      📋 History
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteUser(user)}
                      className="bg-gradient-to-r from-red-600 to-rose-700 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                    >
                      ❌ Delete
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Purchase Modal */}
        <AnimatePresence>
          {showPurchaseModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl w-96 border border-purple-500/30"
              >
                <h2 className="text-2xl font-bold mb-4 text-purple-400 break-words">
                  🍕 Buy Pizza for {selectedUser.name}
                </h2>
                
                <div className="text-sm text-gray-400 mb-4">
                  Available: 🪙 {selectedUser.coins} coins
                </div>

                <div className="grid gap-3 mb-4 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-purple-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {pizzaSlices.map((slice) => (
                    <div
                      key={slice.id}
                      className="flex justify-between items-center border border-purple-500/20 rounded-lg p-3 bg-gray-900/50"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="font-semibold text-sm break-words">{slice.name}</p>
                        <p className="text-yellow-500 text-sm">🪙 {slice.price}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-gradient-to-r from-red-500 to-red-600 w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                          onClick={() => handleRemoveFromCart(slice.id)}
                          disabled={!cart.find((item) => item.slice.id === slice.id)?.quantity}
                        >
                          <Minus size={14} strokeWidth={3} />
                        </motion.button>
                        <span className="w-6 text-center text-sm font-medium">
                          {cart.find((item) => item.slice.id === slice.id)?.quantity || 0}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-gradient-to-r from-green-500 to-green-600 w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                          onClick={() => handleAddToCart(slice)}
                          disabled={selectedUser.coins < slice.price + totalCost}
                        >
                          <Plus size={14} strokeWidth={3} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center font-bold text-sm mb-4 p-3 border border-purple-500/20 rounded-lg bg-purple-500/10">
                  <p>Total Cost:</p>
                  <p className="text-yellow-500">🪙 {totalCost}</p>
                </div>

                <div className="grid gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePurchase}
                    className="w-full bg-gradient-to-r from-purple-500 to-red-500 text-white py-2.5 rounded-lg font-bold text-sm shadow-lg hover:shadow-purple-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={cart.length === 0}
                  >
                    Complete Purchase
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPurchaseModal(false)}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2.5 rounded-lg font-bold text-sm"
                    // className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2.5 rounded-lg font-bold text-sm"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Modal */}
        <AnimatePresence>
          {showHistoryModal && selectedUser && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl w-96 border border-purple-500/30"
              >
                <h2 className="text-2xl font-bold mb-4 text-purple-400 break-words">
                  📋 History for {selectedUser.name}
                </h2>
                
                <div className="text-sm text-gray-400 mb-4">
                  Available: 🪙 {selectedUser.coins} coins
                </div>

                <div className="grid gap-3 mb-4 max-h-64 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-purple-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                  {history.length > 0 ? (
                    history.map((entry) => (
                      <motion.div
                        key={entry.slice_id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex justify-between items-center border border-purple-500/20 rounded-lg p-3 bg-gray-900/50"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <p className="font-semibold text-sm break-words">{entry.slice_name}</p>
                          <p className="text-gray-400 text-xs break-words">
                            🕒 {new Date(entry.purchased_at).toLocaleString()}
                          </p>
                        </div>
                        {!entry.eaten_at ? (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                            onClick={() => logPizzaAsEaten(entry.id)}
                            disabled={loading}
                          >
                            Mark Eaten
                          </motion.button>
                        ) : (
                          <span className="text-green-400 text-xs flex-shrink-0">
                            ✅ Eaten
                          </span>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      No purchases yet
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setShowHistoryModal(false);
                      setShowPurchaseModal(false);
                    }}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 text-white py-2.5 rounded-lg font-bold text-sm"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-xl w-96 border border-purple-500/30"
              >
                <h2 className="text-xl font-bold mb-4 text-purple-400 text-center break-words">
                  Are you sure you want to delete {userToDelete?.name}?
                </h2>

                <div className="flex justify-between items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      if (userToDelete) {
                        try {
                          const response = await fetch(`${API_URL}/users/${userToDelete.id}`, {
                            method: "DELETE",
                          });
                          if (!response.ok) throw new Error("Failed to delete user");
                          await fetchUsers();
                          setShowDeleteConfirmation(false);
                          setPopupMessage("User deleted successfully.");
                          setShowPopup(true);
                        } catch (error) {
                          console.error("Error deleting user:", error);
                          setShowDeleteConfirmation(false);
                          setPopupMessage("Failed to delete user.");
                          setShowPopup(true);
                        }
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-red-500/50 transition-all duration-300"
                  >
                    Confirm
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 py-3 rounded-lg font-semibold text-white shadow-lg hover:shadow-gray-500/50 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Popup */}
        <AnimatePresence>
          {showPopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto text-center"
              >
                <p className="text-xl font-semibold text-black break-words">{popupMessage}</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPopup(false)}
                  className="mt-4 bg-red-500 text-white py-2 px-6 rounded-lg"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ManagePlayers;
