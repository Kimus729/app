
import type {NextConfig} from 'next';

// Determine if the build is running in GitHub Actions
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export', // Crucial for static site generation (GitHub Pages)
  // Set basePath explicitly for GitHub Pages deployment to '/app'
  basePath: isGithubActions ? '/app' : undefined,
  images: {
    unoptimized: true, // Necessary for static exports with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Expose the GITHUB_ACTIONS environment variable to the client-side
  env: {
    NEXT_PUBLIC_GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
  }
};

export default nextConfig;
