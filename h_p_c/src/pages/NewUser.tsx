import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

interface FormData {
  name: string;
  age: number;
  gender: string;
}

const FormComponent = () => {
  const [formData, setFormData] = useState<FormData>({ name: '', age: 0, gender: '' });
  const [error, setError] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || formData.age <= 0 || !formData.gender) {
      setError('Please fill in all fields correctly');
      return;
    }

    setError('');

    try {
      const response = await fetch('http://localhost:5000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setPopupMessage("User added successfully");
        setShowPopup(true);
      } else {
        alert(`Error: ${result.message}`);
      }

      setFormData({ name: '', age: 0, gender: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong! Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative p-8">
      <div className="max-w-xl mx-auto relative">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center mb-12"
        >
          <UserPlus className="w-12 h-12 text-purple-400 mr-3" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
            New User
          </h1>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden border border-purple-500/20 p-8"
        >
          {error && (
            <div className="text-red-400 text-center mb-6 bg-red-400/10 rounded-lg p-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-purple-400 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-purple-400 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-purple-400 mb-2">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white font-bold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-fuchsia-600 transition-all duration-300 shadow-lg shadow-purple-500/25"
            >
              Submit
            </motion.button>
          </form>
        </motion.div>
      </div>
      {showPopup && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm mx-auto text-center">
                  <p className="text-xl font-semibold text-black">{popupMessage}</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPopup(false)}
                    className="mt-4 bg-red-500 text-white py-2 px-6 rounded-lg"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            )}
    </div>
  );
};

export default FormComponent;