import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import io from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

interface UserRank {
  name: string;
  number_of_pizza_eaten: number;
  rank: number;
}

export default function Leaderboard() {
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRankings();

    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ['polling', 'websocket'],
    });

    console.log("Connected with server");

    socket.on('response', (data) => {
      console.log("Data received:", data);
      if (data.message === 'update_leaderboard') {
        console.log("Received update notification.");
        fetchRankings();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setError('WebSocket connection error. Please try again later.');
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected.");
    };
  }, []);

  const fetchRankings = async () => {
    try {
      const response = await fetch('http://localhost:5000/leaderboard');
      if (!response.ok) {
        throw new Error('Failed to fetch rankings');
      }
      const data = await response.json();
      setRankings(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError('Failed to load rankings. Please try again later.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black text-purple-400">
        <div >Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative p-8">
      {/* Animated background elements
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute animate-spin-slow top-10 left-10 w-64 h-64 border-4 border-purple-500 rounded-full"></div>
        <div className="absolute animate-spin-reverse top-[40%] right-20 w-48 h-48 border-4 border-violet-500 rounded-full"></div>
        <div className="absolute animate-bounce bottom-20 left-[30%] w-32 h-32 border-4 border-fuchsia-500 rounded-full"></div>
      // </div> */}

      <div className="max-w-3xl mx-auto relative">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center mb-12"
        >
          <Trophy className="w-12 h-12 text-purple-400 mr-3" />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
            Leaderboard
          </h1>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl shadow-purple-500/10 overflow-hidden border border-purple-500/20"
        >
          <div className="grid grid-cols-4 gap-4 p-6 bg-black/50 font-bold text-lg text-purple-300">
            <div>Rank</div>
            <div className="col-span-2">Player</div>
            <div className="text-right">Pizzas Eaten</div>
          </div>

          <div className="divide-y divide-purple-500/20">
            <AnimatePresence>
              {rankings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-12 text-center text-purple-400 text-xl"
                >
                  No rankings available yet. Start eating some pizza! 🍕
                </motion.div>
              ) : (
                rankings.map((rank, index) => (
                  <motion.div
                    key={rank.rank}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="grid grid-cols-4 gap-4 p-6 items-center hover:bg-purple-500/5 transition-all duration-300"
                  >
                    <div className="font-mono text-2xl">
                      {rank.rank === 1 && (
                        <span className="animate-pulse">🥇</span>
                      )}
                      {rank.rank === 2 && '🥈'}
                      {rank.rank === 3 && '🥉'}
                      {rank.rank > 3 && (
                        <span className="text-purple-400">#{rank.rank}</span>
                      )}
                    </div>
                    <div className="col-span-2">
                      <div className="font-bold text-lg bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent">
                        {rank.name}
                      </div>
                    </div>
                    <div className="text-right font-bold text-lg text-purple-400">
                      {rank.number_of_pizza_eaten} 🍕
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
