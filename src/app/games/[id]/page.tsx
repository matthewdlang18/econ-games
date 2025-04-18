'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function GamePage() {
  const params = useParams();
  const gameId = params.id as string;
  const [game, setGame] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<any>({});
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadGame = async () => {
      try {
        // Get the current user
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        setUser(session.user);

        // Get the game details
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('*')
          .eq('id', gameId)
          .single();

        if (gameError || !gameData) {
          throw new Error('Game not found');
        }

        setGame(gameData);

        // Check if the user has already submitted a response for this round
        const { data: responseData } = await supabase
          .from('game_responses')
          .select('*')
          .eq('game_id', gameId)
          .eq('user_id', session.user.id)
          .eq('round', gameData.current_round)
          .single();

        if (responseData) {
          setResponse(responseData.response);
          setSubmitted(true);
        }

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    loadGame();
  }, [gameId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Submit the response
      const { error: submitError } = await supabase
        .from('game_responses')
        .insert([{
          game_id: gameId,
          user_id: user.id,
          round: game.current_round,
          response: response
        }]);

      if (submitError) {
        throw new Error(`Error submitting response: ${submitError.message}`);
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResponse((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  const renderGameContent = () => {
    if (!game) return null;

    switch (game.type) {
      case 'supply_demand':
        return renderSupplyDemandGame();
      case 'prisoners_dilemma':
        return renderPrisonersDilemmaGame();
      case 'public_goods':
        return renderPublicGoodsGame();
      case 'auction':
        return renderAuctionGame();
      default:
        return (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Game Not Available</h2>
            <p className="text-gray-600">
              This game type is not currently implemented.
            </p>
          </div>
        );
    }
  };

  const renderSupplyDemandGame = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Supply and Demand Simulation</h2>
        <p className="text-gray-600 mb-6">
          In this market simulation, you will {game.current_round === 1 ? 'set your initial price' : 'adjust your price based on market feedback'}.
        </p>

        {submitted ? (
          <div className="bg-green-100 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Response Submitted</h3>
            <p className="text-green-700">
              Your price: ${response.price || 'N/A'}
            </p>
            <p className="mt-4 text-gray-600">
              Please wait for the next round to be started by your TA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Set Your Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                required
                value={response.price || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderPrisonersDilemmaGame = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Prisoner's Dilemma</h2>
        <p className="text-gray-600 mb-6">
          You and another student are in separate rooms and cannot communicate. You both have two choices: cooperate or defect.
        </p>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Payoff Matrix</h3>
          <div className="border border-gray-300 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Player Cooperates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Other Player Defects</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">You Cooperate</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Both get $3</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">You get $0, Other gets $5</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">You Defect</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">You get $5, Other gets $0</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Both get $1</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {submitted ? (
          <div className="bg-green-100 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Response Submitted</h3>
            <p className="text-green-700">
              Your choice: {response.choice === 'cooperate' ? 'Cooperate' : 'Defect'}
            </p>
            <p className="mt-4 text-gray-600">
              Please wait for the next round to be started by your TA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make Your Choice
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="radio"
                    id="cooperate"
                    name="choice"
                    value="cooperate"
                    checked={response.choice === 'cooperate'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="cooperate" className="text-gray-700">Cooperate</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="defect"
                    name="choice"
                    value="defect"
                    checked={response.choice === 'defect'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label htmlFor="defect" className="text-gray-700">Defect</label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderPublicGoodsGame = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Public Goods Game</h2>
        <p className="text-gray-600 mb-6">
          You have $10. You can contribute any amount to a public pool. The total amount in the pool will be multiplied by 1.5 and divided equally among all players, regardless of their contribution.
        </p>

        {submitted ? (
          <div className="bg-green-100 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Response Submitted</h3>
            <p className="text-green-700">
              Your contribution: ${response.contribution || '0'}
            </p>
            <p className="mt-4 text-gray-600">
              Please wait for the next round to be started by your TA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contribution" className="block text-sm font-medium text-gray-700 mb-1">
                Your Contribution ($0-$10)
              </label>
              <input
                type="number"
                id="contribution"
                name="contribution"
                min="0"
                max="10"
                step="1"
                required
                value={response.contribution || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderAuctionGame = () => {
    return (
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Auction</h2>
        <p className="text-gray-600 mb-6">
          You are bidding on an item with a value to you of $100. The highest bidder wins the item and pays their bid amount.
        </p>

        {submitted ? (
          <div className="bg-green-100 p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Response Submitted</h3>
            <p className="text-green-700">
              Your bid: ${response.bid || '0'}
            </p>
            <p className="mt-4 text-gray-600">
              Please wait for the next round to be started by your TA.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="bid" className="block text-sm font-medium text-gray-700 mb-1">
                Your Bid ($)
              </label>
              <input
                type="number"
                id="bid"
                name="bid"
                min="0"
                step="0.01"
                required
                value={response.bid || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="bg-red-100 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/games')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {game?.type?.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
            </h1>
            <p className="text-gray-600">
              Round {game?.current_round} of {game?.max_rounds}
            </p>
          </div>
          <button
            onClick={() => router.push('/games')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Games
          </button>
        </div>

        {renderGameContent()}
      </div>
    </div>
  );
}
