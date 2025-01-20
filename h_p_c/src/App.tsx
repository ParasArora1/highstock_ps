import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NewUser from './pages/NewUser';
import ManagePlayers from './pages/ManagePlayers';
import Leaderboard from './pages/Leaderboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new-user" element={<NewUser />} />
              <Route path="/manage-players" element={<ManagePlayers />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </motion.main>
        </AnimatePresence>
      </div>
    </Router>
  );
}

export default App;