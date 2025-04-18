/** @type {import('next').NextConfig} */
const nextConfig = {
  // We'll use server-side rendering for authentication
  images: {
    domains: ['supabase.com'],
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
