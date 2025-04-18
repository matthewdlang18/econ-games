/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for GitHub Pages
  output: 'export',
  // Set the base path for GitHub Pages
  basePath: process.env.NODE_ENV === 'production' ? '/econ-games' : '',
  // Configure images for static export
  images: {
    unoptimized: true,
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable dynamic routes for static export
  experimental: {
    // This will disable dynamic routes for static export
    // We'll handle routing client-side
    disableStaticImages: true,
  },
};

export default nextConfig;
