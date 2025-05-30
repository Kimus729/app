
import type {NextConfig} from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

// For a custom domain pointing to the root of the GitHub Pages site,
// basePath should be undefined or an empty string.
// If you were deploying to a subdirectory like kimus729.github.io/app, it would be '/app'.
const basePathValue = undefined; 

const nextConfig: NextConfig = {
  output: 'export', // Crucial for static site generation (GitHub Pages)
  basePath: basePathValue,       // Set to undefined or '' for custom root domain
  images: {
    unoptimized: true,      // Serve images as-is, necessary for static exports
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
  env: {
    NEXT_PUBLIC_GITHUB_ACTIONS: process.env.GITHUB_ACTIONS === 'true' ? 'true' : 'false',
    // GITHUB_REPOSITORY is still useful if you have other logic depending on it,
    // but not for constructing base paths for assets on a custom root domain.
    NEXT_PUBLIC_GITHUB_REPOSITORY: process.env.GITHUB_REPOSITORY || '', 
  },
};

export default nextConfig;
