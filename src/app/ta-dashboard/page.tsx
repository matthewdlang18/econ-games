'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TADashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      // Check if user is a TA
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData?.user?.user_metadata?.role !== 'ta') {
        // If not a TA, redirect to student games page
        router.push('/games');
        return;
      }
      
      setUser(userData.user);
      
      // Fetch active games
      const { data: games } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'active');
      
      if (games) {
        setActiveGames(games);
      }
      
      setLoading(false);
    };
    
    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const startNewGame = async (gameType: string) => {
    const { data, error } = await supabase
      .from('games')
      .insert([
        { 
          type: gameType, 
          status: 'active',
          created_by: user.id,
          current_round: 1,
          max_rounds: 5
        }
      ])
      .select();
    
    if (error) {
      console.error('Error starting game:', error);
      return;
    }
    
    // Refresh the games list
    const { data: games } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'active');
    
    if (games) {
      setActiveGames(games);
    }
  };

  const advanceRound = async (gameId: string) => {
    // Find the game
    const game = activeGames.find(g => g.id === gameId);
    
    if (!game) return;
    
    // If this is the last round, end the game
    if (game.current_round >= game.max_rounds) {
      const { error } = await supabase
        .from('games')
        .update({ status: 'completed' })
        .eq('id', gameId);
      
      if (error) {
        console.error('Error ending game:', error);
        return;
      }
    } else {
      // Otherwise, advance to the next round
      const { error } = await supabase
        .from('games')
        .update({ current_round: game.current_round + 1 })
        .eq('id', gameId);
      
      if (error) {
        console.error('Error advancing round:', error);
        return;
      }
    }
    
    // Refresh the games list
    const { data: games } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'active');
    
    if (games) {
      setActiveGames(games);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TA Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, Teaching Assistant!</h2>
          <p className="text-gray-600">
            You can manage class games from this dashboard.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Start New Game</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => startNewGame('supply_demand')}
                className="p-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Supply and Demand
              </button>
              <button
                onClick={() => startNewGame('prisoners_dilemma')}
                className="p-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Prisoner's Dilemma
              </button>
              <button
                onClick={() => startNewGame('public_goods')}
                className="p-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Public Goods Game
              </button>
              <button
                onClick={() => startNewGame('auction')}
                className="p-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Auction
              </button>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Active Games</h2>
            {activeGames.length === 0 ? (
              <p className="text-gray-600">No active games at the moment.</p>
            ) : (
              <div className="space-y-4">
                {activeGames.map((game) => (
                  <div key={game.id} className="bg-white shadow-md rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">
                          {game.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Round {game.current_round} of {game.max_rounds}
                        </p>
                      </div>
                      <button
                        onClick={() => advanceRound(game.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        {game.current_round >= game.max_rounds ? 'End Game' : 'Next Round'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
