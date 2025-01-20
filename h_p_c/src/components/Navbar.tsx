import { Pizza } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-purple-500/20 relative z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <Pizza className="h-8 w-8 text-purple-400 group-hover:text-fuchsia-400 transition-colors" />
            </motion.div>
            
          </Link>
          
          {/* Desktop navigation links */}
          <div className="hidden sm:flex space-x-8">
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
              </Link>
            ))}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="sm:hidden flex items-center">
            <button
              className="text-purple-400 hover:text-fuchsia-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {/* Hamburger icon (3 dashes) */}
              <div className="space-y-1">
                <div className="w-6 h-0.5 bg-purple-400"></div>
                <div className="w-6 h-0.5 bg-purple-400"></div>
                <div className="w-6 h-0.5 bg-purple-400"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Page Overlay to Blur Content */}
      <div
        className={`sm:hidden fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 ${isMenuOpen ? 'block' : 'hidden'} z-40`}
        style={{ backdropFilter: 'blur(5px)' }}
      ></div>

      {/* Mobile Menu (Full-Screen Sliding Overlay with Background Blur) */}
      <motion.div
        className="sm:hidden absolute top-0 left-0 w-full h-full bg-black bg-opacity-80 backdrop-blur-md text-white py-4 px-6 space-y-4 z-50"
        initial={{ x: '-100%' }}
        animate={{ x: isMenuOpen ? 0 : '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-end">
          <button
            className="text-purple-400 hover:text-fuchsia-400"
            onClick={() => setIsMenuOpen(false)} // Close menu
          >
            {/* Close Icon */}
            <div className="w-6 h-0.5 bg-purple-400 rotate-45 mb-1"></div>
            <div className="w-6 h-0.5 bg-purple-400 -rotate-45"></div>
          </button>
        </div>
        
        <div className="flex flex-col space-y-4">
          {[ 
            { path: '/', label: 'Home' },
            { path: '/new-user', label: 'New User' },
            { path: '/manage-players', label: 'Manage Players' },
            { path: '/leaderboard', label: 'Leaderboard' }
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`text-lg font-medium py-2 px-4 rounded-lg transition-colors ${
                isActive(path) ? 'text-purple-400' : 'text-gray-300 hover:text-purple-400'
              }`}
              onClick={() => setIsMenuOpen(false)} // Close menu on link click
            >
              {label}
            </Link>
          ))}
        </div>
      </motion.div>
    </nav>
  );
}
