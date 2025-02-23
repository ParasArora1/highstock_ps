import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zllmedoapyxuerctyfwl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbG1lZG9hcHl4dWVyY3R5ZndsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzA0ODQ0NSwiZXhwIjoyMDUyNjI0NDQ1fQ.E79VF3e8iPApqObEKuJrZQWozc8ZCSDEKzeSbQRj3dg';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    fetchRankings(); // Fetch initial leaderboard data

    // Set up real-time subscription to listen for changes
    const channel = supabase
      .channel('user-updates') // Channel name can be anything
      .on(
        'postgres_changes', // Real-time event type
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user', // Table name
        },
        () => {
          console.log('Real-time update received');
          fetchRankings(); // Re-fetch leaderboard data on update
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRankings = async () => {
    try {
      const { data, error } = await supabase
        .from('user') // Query the user table
        .select('name, number_of_pizza_eaten')
        .gt('number_of_pizza_eaten', 0) // Filter users with pizzas eaten > 0
        .order('number_of_pizza_eaten', { ascending: false }); // Sort in descending order

      if (error) {
        throw error;
      }

      const rankedData = data.map((user, index) => ({
        name: user.name,
        number_of_pizza_eaten: user.number_of_pizza_eaten,
        rank: index + 1,
      }));

      setRankings(rankedData);
      setError(null);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setError('Failed to load rankings. Please try again later.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-purple-400 mr-3" />
          <h1 className="text-3xl sm:text-5xl font-bold text-purple-400">Leaderboard</h1>
        </div>

        <div className="bg-[#121212] rounded-xl sm:rounded-2xl overflow-hidden border border-purple-500/20">
          <div className="grid grid-cols-12 gap-2 p-4 sm:p-6 bg-black/50 font-bold text-sm sm:text-lg text-purple-300">
            <div className="col-span-2 sm:col-span-3">Rank</div>
            <div className="col-span-6 sm:col-span-6">Player</div>
            <div className="col-span-4 sm:col-span-3 text-right">Pizzas</div>
          </div>

          <div className="divide-y divide-purple-500/20">
            {rankings.length === 0 ? (
              <div className="p-8 text-center text-purple-400 text-base sm:text-xl animate-pulse">
                No rankings available yet. Start eating some pizza! 🍕
              </div>
            ) : (
              rankings.map((rank) => (
                <div
                  key={rank.rank}
                  className="grid grid-cols-12 gap-2 p-4 sm:p-6 items-center hover:bg-purple-500/5"
                >
                  <div className="col-span-2 sm:col-span-3 font-mono text-xl">
                    {rank.rank === 1 && '🥇'}
                    {rank.rank === 2 && '🥈'}
                    {rank.rank === 3 && '🥉'}
                    {rank.rank > 3 && `#${rank.rank}`}
                  </div>
                  <div className="col-span-6 sm:col-span-6">
                    <div className="font-bold text-sm sm:text-lg text-purple-400 truncate">
                      {rank.name}
                    </div>
                  </div>
                  <div className="col-span-4 sm:col-span-3 text-right font-bold text-sm sm:text-lg text-purple-400">
                    {rank.number_of_pizza_eaten}
                    <span className="ml-2">🍕</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
