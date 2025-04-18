'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { redirectIfNotAuthenticated } from '@/lib/auth-utils';

export default function GamesPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [joinedGames, setJoinedGames] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const isAuthenticated = await redirectIfNotAuthenticated(router);
      if (!isAuthenticated) return;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session!.user);

      // Fetch active games
      const { data: games } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'active');

      if (games) {
        setActiveGames(games);

        // Check which games the user has joined
        const { data: participations } = await supabase
          .from('game_participants')
          .select('game_id')
          .eq('user_id', session.user.id);

        if (participations) {
          const joinedGameIds = participations.map(p => p.game_id);
          const joined = games.filter(game => joinedGameIds.includes(game.id));
          setJoinedGames(joined);
        }
      }

      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const joinGame = async (gameId: string) => {
    try {
      // Add the user to the game participants
      const { error } = await supabase
        .from('game_participants')
        .insert([{
          game_id: gameId,
          user_id: user.id
        }]);

      if (error) {
        console.error('Error joining game:', error);
        return;
      }

      // Refresh the games lists
      const { data: games } = await supabase
        .from('games')
        .select('*')
        .eq('status', 'active');

      if (games) {
        setActiveGames(games);

        // Update joined games
        const { data: participations } = await supabase
          .from('game_participants')
          .select('game_id')
          .eq('user_id', user.id);

        if (participations) {
          const joinedGameIds = participations.map(p => p.game_id);
          const joined = games.filter(game => joinedGameIds.includes(game.id));
          setJoinedGames(joined);
        }
      }

      // Navigate to the game page
      router.push(`/games/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const getGameDescription = (gameType: string): string => {
    switch (gameType) {
      case 'supply_demand':
        return 'Participate in a market simulation to understand supply and demand dynamics.';
      case 'prisoners_dilemma':
        return 'Experience game theory in action with this classic economic scenario.';
      case 'public_goods':
        return 'Learn about cooperation and free-riding in public resource management.';
      case 'auction':
        return 'Participate in an auction to understand bidding strategies and market clearing.';
      default:
        return 'Join this economics game to learn key concepts through interactive play.';
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
          <h1 className="text-3xl font-bold">Economics Games</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Welcome, Student!</h2>
          <p className="text-gray-600">
            Your user ID: {user?.user_metadata?.user_id || 'Not available'}
          </p>
        </div>

        {activeGames.length === 0 ? (
          <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-2">No Active Games</h2>
            <p className="text-gray-600">
              There are no active games at the moment. Please check back later when your TA starts a game.
            </p>
          </div>
        ) : (
          <>
            {joinedGames.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Your Active Games</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {joinedGames.map(game => (
                    <div key={game.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow border-l-4 border-green-500">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">
                          {game.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Round {game.current_round}/{game.max_rounds}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {getGameDescription(game.type)}
                      </p>
                      <button
                        onClick={() => router.push(`/games/${game.id}`)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full"
                      >
                        Continue Game
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">Available Games</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeGames
                  .filter(game => !joinedGames.some(j => j.id === game.id))
                  .map(game => (
                    <div key={game.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold">
                          {game.type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </h3>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Round {game.current_round}/{game.max_rounds}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        {getGameDescription(game.type)}
                      </p>
                      <button
                        onClick={() => joinGame(game.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 w-full"
                      >
                        Join Game
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
