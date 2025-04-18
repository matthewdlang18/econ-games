import { supabase } from './supabase';

export async function checkAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function checkTARole() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  
  const userRole = session.user?.user_metadata?.role;
  return userRole === 'ta';
}

export async function redirectIfNotAuthenticated(router: any) {
  const session = await checkAuth();
  if (!session) {
    router.push('/login');
    return false;
  }
  return true;
}

export async function redirectIfNotTA(router: any) {
  const isTA = await checkTARole();
  if (!isTA) {
    router.push('/games');
    return false;
  }
  return true;
}
