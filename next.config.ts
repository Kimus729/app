
import type {NextConfig} from 'next';

// Determine if the build is running in GitHub Actions
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  output: 'export', // Crucial for static site generation (GitHub Pages)
  basePath: isGithubActions ? '/app' : undefined, // Set basePath for GitHub Pages deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
};

export default nextConfig;
