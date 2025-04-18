'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // First, check if this is a valid passcode in your existing table
      // Adjust the table name and column names to match your Supabase schema
      const { data: userData, error: userError } = await supabase
        .from('users') // Replace with your actual table name for users/passcodes
        .select('*')
        .eq('passcode', passcode) // Adjust column name if different
        .single();

      if (userError || !userData) {
        throw new Error('Invalid passcode');
      }

      // Determine if this is a student or TA
      const role = userData.role || (userData.is_ta ? 'ta' : 'student');
      const userId = userData.id || userData.user_id;

      // Create a session using Supabase Auth
      // We'll use a consistent pattern for email/password based on the passcode
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `${passcode}@econ-games.example`, // Using passcode as part of email
        password: passcode, // Using passcode as password
      });

      // If the user doesn't exist in Auth yet, create them
      if (authError && authError.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: `${passcode}@econ-games.example`,
          password: passcode,
          options: {
            data: {
              role: role,
              user_id: userId
            }
          }
        });

        if (signUpError) {
          throw new Error(`Error creating account: ${signUpError.message}`);
        }

        // After signup, sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: `${passcode}@econ-games.example`,
          password: passcode,
        });

        if (signInError) {
          throw new Error(`Error signing in: ${signInError.message}`);
        }
      } else if (authError) {
        // Some other auth error occurred
        throw new Error(`Authentication error: ${authError.message}`);
      }

      // Redirect based on role
      if (role === 'ta') {
        router.push('/ta-dashboard');
      } else {
        router.push('/games');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Economics Course Games</h1>
          <p className="mt-2 text-gray-600">Enter your passcode to continue</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="passcode" className="block text-sm font-medium text-gray-700">
              Passcode
            </label>
            <input
              id="passcode"
              name="passcode"
              type="text"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your passcode"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
