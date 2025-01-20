import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import io from 'socket.io-client';

interface UserRank {
  name: string;
  number_of_pizza_eaten: number;
  rank: number;
}

export default function Leaderboard() {
  const [rankings, setRankings] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchRankings();

    const socket = io("https://highstock-ps-1.onrender.com", {
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
      const response = await fetch('https://highstock-ps-1.onrender.com/leaderboard');
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-black">
        <div className="text-red-400 text-base sm:text-xl px-4 text-center animate-pulse">{error}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-black text-white p-4 sm:p-8 transition-all duration-1000 ease-in-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="max-w-3xl mx-auto">
        {/* Animated Header */}
        <div className="flex items-center justify-center mb-8 sm:mb-12 animate-fadeIn">
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mr-3 animate-bounce" />
          <h1 className="text-3xl sm:text-5xl font-bold text-purple-400 animate-slideIn">
            Leaderboard
          </h1>
        </div>

        {/* Leaderboard Table with Animation */}
        <div className="bg-[#121212] rounded-xl sm:rounded-2xl overflow-hidden border border-purple-500/20 transform transition-all duration-500 hover:shadow-lg hover:shadow-purple-500/10">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-4 sm:p-6 bg-black/50 font-bold text-sm sm:text-lg text-purple-300">
            <div className="col-span-2 sm:col-span-3">Rank</div>
            <div className="col-span-6 sm:col-span-6">Player</div>
            <div className="col-span-4 sm:col-span-3 text-right">Pizzas</div>
          </div>

          {/* Table Body with Staggered Animation */}
          <div className="divide-y divide-purple-500/20">
            {rankings.length === 0 ? (
              <div className="p-8 text-center text-purple-400 text-base sm:text-xl animate-pulse">
                No rankings available yet. Start eating some pizza! 🍕
              </div>
            ) : (
              rankings.map((rank, index) => (
                <div
                  key={rank.rank}
                  className={`grid grid-cols-12 gap-2 p-4 sm:p-6 items-center transform transition-all duration-300 hover:bg-purple-500/5 animate-slideInFromRight`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="col-span-2 sm:col-span-3 font-mono text-xl">
                    {rank.rank === 1 && <span className="animate-bounce inline-block">🥇</span>}
                    {rank.rank === 2 && <span className="animate-bounce inline-block" style={{ animationDelay: '100ms' }}>🥈</span>}
                    {rank.rank === 3 && <span className="animate-bounce inline-block" style={{ animationDelay: '200ms' }}>🥉</span>}
                    {rank.rank > 3 && (
                      <span className="text-purple-400 text-base sm:text-xl">#{rank.rank}</span>
                    )}
                  </div>
                  <div className="col-span-6 sm:col-span-6">
                    <div className="font-bold text-sm sm:text-lg text-purple-400 truncate hover:scale-105 transform transition-transform duration-200">
                      {rank.name}
                    </div>
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-right font-bold text-sm sm:text-lg text-purple-400">
                    <span className="hover:scale-110 inline-block transform transition-transform duration-200">
                      {rank.number_of_pizza_eaten}
                    </span>
                    <span className="ml-2 inline-block hover:rotate-12 transform transition-transform duration-200">🍕</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(1rem);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideInFromRight {
          animation: slideInFromRight 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
