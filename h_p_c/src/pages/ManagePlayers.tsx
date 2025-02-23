import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

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
  user_id: number;
  slice_id: number;
  slice_name: string;
  purchased_at: string;
  eaten_at: string | null;
}

// Create a Supabase client using your credentials
const supabaseUrl = 'https://zllmedoapyxuerctyfwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG1lZG9hcHl4dWVyY3R5ZndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA0ODQ0NSwiZXhwIjoyMDUyNjI0NDQ1fQ.E79VF3e8iPApqObEKuJrZQWozc8ZCSDEKzeSbQRj3dg';
const supabase = createClient(supabaseUrl, supabaseKey);

const ManagePlayers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [pizzaSlices, setPizzaSlices] = useState<PizzaSlice[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [history, setHistory] = useState<UserPizzaHistory[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchUsers();
    fetchPizzaSlices();

    // Set up realtime subscriptions using the new channel API

    // Subscription for the "users" table
    const usersChannel = supabase.channel("users-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("Users table change:", payload);
          fetchUsers();
        }
      )
      .subscribe();

    // Subscription for the "pizza_slices" table
    const pizzaChannel = supabase.channel("pizza_slices-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pizza_slices" },
        (payload) => {
          console.log("Pizza slices table change:", payload);
          fetchPizzaSlices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(pizzaChannel);
    };
  }, []);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error);
      setError("Error fetching users.");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const fetchPizzaSlices = async () => {
    const { data, error } = await supabase.from("pizza_slices").select("*");
    if (error) {
      console.error("Error fetching pizza slices:", error);
    } else {
      setPizzaSlices(data || []);
    }
  };

  const fetchUserHistory = async (userId: number) => {
    const { data, error } = await supabase
      .from("user_history")
      .select("*")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false });
    if (error) {
      console.error("Error fetching user history:", error);
      setPopupMessage("Failed to fetch history.");
      setShowPopup(true);
    } else {
      setHistory(data || []);
      setShowHistoryModal(true);
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

  const logPizzaAsEaten = async (historyId: number) => {
    if (!selectedUser) return;
    const { error } = await supabase
      .from("user_history")
      .update({ eaten_at: new Date().toISOString() })
      .eq("id", historyId)
      .eq("user_id", selectedUser.id);
    if (error) {
      console.error("Error logging pizza slice as eaten:", error);
      setPopupMessage("Failed to log pizza slice.");
      setShowPopup(true);
    } else {
      await fetchUserHistory(selectedUser.id);
      setPopupMessage("Pizza slice logged as eaten!");
      setShowPopup(true);
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

    // Update the user's coins
    const { error: updateError } = await supabase
      .from("users")
      .update({ coins: selectedUser.coins - totalCost })
      .eq("id", selectedUser.id);
    if (updateError) {
      console.error("Error updating user coins:", updateError);
      setPopupMessage("Failed to complete the purchase.");
      setShowPopup(true);
      return;
    }

    // Insert purchase records into the user_history table
    const purchaseRecords = cart.flatMap((item) =>
      Array(item.quantity).fill({
        user_id: selectedUser.id,
        slice_id: item.slice.id,
        slice_name: item.slice.name,
        purchased_at: new Date().toISOString(),
        eaten_at: null,
      })
    );
    const { error: insertError } = await supabase
      .from("user_history")
      .insert(purchaseRecords);
    if (insertError) {
      console.error("Error inserting purchase records:", insertError);
      setPopupMessage("Failed to complete the purchase.");
      setShowPopup(true);
      return;
    }

    await fetchUsers();
    setShowPurchaseModal(false);
    setCart([]);
    setPopupMessage("Purchase completed successfully.");
    setShowPopup(true);
  };

  const totalCost = cart.reduce(
    (sum, item) => sum + item.slice.price * item.quantity,
    0
  );

  const deleteUser = async () => {
    if (!userToDelete) return;
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", userToDelete.id);
    if (error) {
      console.error("Error deleting user:", error);
      setPopupMessage("Failed to delete user.");
    } else {
      await fetchUsers();
      setPopupMessage("User deleted successfully.");
    }
    setShowDeleteConfirmation(false);
    setShowPopup(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black text-purple-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Rest of your component JSX remains unchanged */}
      {/* ... */}
    </div>
  );
};

export default ManagePlayers;
