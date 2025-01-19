import { Pizza, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative p-8">
      <div className="max-w-4xl mx-auto relative">
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
            Welcome to Pizza Paradise
          </h1>
        </motion.div>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <motion.div variants={item}>
            <Link 
              to="/new-user"
              className="block h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl shadow-purple-500/10 border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Users className="w-12 h-12 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  New User
                </h2>
                <p className="text-purple-300/60 text-center">
                  Join the pizza eating challenge
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link 
              to="/leaderboard"
              className="block h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl shadow-purple-500/10 border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Trophy className="w-12 h-12 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  Leaderboard
                </h2>
                <p className="text-purple-300/60 text-center">
                  See who's eating the most pizza
                </p>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <Link 
              to="/manage-players"
              className="block h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl shadow-purple-500/10 border border-purple-500/20 p-8 hover:border-purple-500/40 transition-all duration-300"
            >
              <div className="flex flex-col items-center">
                <Pizza className="w-12 h-12 text-purple-400 mb-4" />
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-fuchsia-500 bg-clip-text text-transparent mb-2">
                  Manage Players
                </h2>
                <p className="text-purple-300/60 text-center">
                  Buy and log pizzas for players
                </p>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}