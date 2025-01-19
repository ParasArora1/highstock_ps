import { Pizza } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-purple-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Pizza className="h-8 w-8 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent">
              Pizza Challenge
            </span>
          </Link>
          
          <div className="flex space-x-8">
            {[
              { path: '/', label: 'Home' },
              { path: '/new-user', label: 'New User' },
              { path: '/manage-players', label: 'Manage Players' },
              { path: '/leaderboard', label: 'Leaderboard' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className="relative group"
              >
                <span className={`text-sm font-medium transition-colors ${
                  isActive(path) 
                    ? 'text-purple-400' 
                    : 'text-gray-300 hover:text-purple-400'
                }`}>
                  {label}
                </span>
                
                {/* Animated underline */}
                <motion.span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-fuchsia-500 rounded-full ${
                    isActive(path) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  initial={false}
                  animate={isActive(path) ? { width: '100%' } : { width: '0%' }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Glowing dot for active state
                {isActive(path) && (
                  <motion.span
                    className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-purple-400"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )} */}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}