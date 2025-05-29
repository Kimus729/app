
import type {NextConfig} from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
// GITHUB_REPOSITORY is in format owner/repo. We need 'repo'.
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'app';

const assetPrefixPath = isGithubActions ? `/${repoName}/` : undefined; // Should be /app/ for your case
const basePathPath = isGithubActions ? `/${repoName}` : undefined;   // Should be /app for your case

const nextConfig: NextConfig = {
  output: 'export', // Crucial for static site generation (GitHub Pages)
  assetPrefix: assetPrefixPath,
  basePath: basePathPath,
  images: {
    unoptimized: true, // Necessary for static exports with next/image
    // Tell next/image to use the assetPrefix for image paths
    // Only set this if assetPrefixPath is defined, otherwise it can cause issues locally
    path: assetPrefixPath ? assetPrefixPath : (process.env.NODE_ENV === 'development' ? undefined : '/_next/image'),
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
  // No longer exposing NEXT_PUBLIC_GITHUB_ACTIONS, relying on assetPrefix/basePath
};

export default nextConfig;
