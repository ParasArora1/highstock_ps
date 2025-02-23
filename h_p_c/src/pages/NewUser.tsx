import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';


const supabaseUrl = 'https://zllmedoapyxuerctyfwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG1lZG9hcHl4dWVyY3R5ZndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA0ODQ0NSwiZXhwIjoyMDUyNjI0NDQ1fQ.E79VF3e8iPApqObEKuJrZQWozc8ZCSDEKzeSbQRj3dg';
const supabase = createClient(supabaseUrl, supabaseKey);

interface FormData {
  name: string;
  age: number;
  gender: string;
}

const FormComponent = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({ name: '', age: 0, gender: '' });
  const [error, setError] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setLoading(false);
  }, []);

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
      const { data, error } = await supabase.from('users').insert([
        {
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
        },
      ]);

      if (error) {
        console.error('Error:', error.message);
        alert(`Error: ${error.message}`);
      } else {
        console.log('Success:', data);
        setPopupMessage('User added successfully');
        setShowPopup(true);
        setFormData({ name: '', age: 0, gender: '' });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong! Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black text-purple-400">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-black text-white p-4 sm:p-8 transition-all duration-1000 ${
        mounted ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="max-w-md mx-auto">
        <div
          className={`flex items-center justify-center mb-8 sm:mb-12 transition-all duration-700 delay-300 transform ${
            mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <UserPlus className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mr-2 sm:mr-3 " />
          <h1 className="text-3xl sm:text-5xl font-bold text-purple-400">New User</h1>
        </div>

        <div
          className={`bg-[#121212] rounded-xl sm:rounded-2xl border border-purple-500/20 p-4 sm:p-8 transition-all duration-700 delay-500 transform ${
            mounted ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
          }`}
        >
          {error && (
            <div className="text-red-400 text-center mb-4 sm:mb-6 bg-red-400/10 rounded-lg p-3 text-sm sm:text-base animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div
              className={`transition-all duration-500 delay-600 transform ${
                mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
            >
              <label
                htmlFor="name"
                className="block text-purple-400 mb-1 sm:mb-2 text-sm sm:text-base"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg p-2 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-all duration-300 hover:border-purple-400"
                placeholder="Enter your name"
              />
            </div>

            <div
              className={`transition-all duration-500 delay-700 transform ${
                mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
            >
              <label
                htmlFor="age"
                className="block text-purple-400 mb-1 sm:mb-2 text-sm sm:text-base"
              >
                Age
              </label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg p-2 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-all duration-300 hover:border-purple-400"
                placeholder="Enter your age"
              />
            </div>

            <div
              className={`transition-all duration-500 delay-800 transform ${
                mounted ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
              }`}
            >
              <label
                htmlFor="gender"
                className="block text-purple-400 mb-1 sm:mb-2 text-sm sm:text-base"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-black/50 border border-purple-500/20 rounded-lg p-2 sm:p-3 text-sm sm:text-base text-white focus:outline-none focus:border-purple-500 transition-all duration-300 hover:border-purple-400"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <button
              type="submit"
              className={`w-full bg-purple-500 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-all duration-500 delay-900 transform hover:bg-purple-600 hover:scale-[1.02] ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      {showPopup && (
        <AnimatePresence>
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
              <p className="text-xl font-semibold text-black">{popupMessage}</p>
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
        </AnimatePresence>
      )}
    </div>
  );
};

export default FormComponent;
