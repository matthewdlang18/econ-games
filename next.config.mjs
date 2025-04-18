/** @type {import('next').NextConfig} */
const nextConfig = {
  // We'll use server-side rendering for authentication
  images: {
    domains: ['supabase.com'],
  },
};

export default nextConfig;
