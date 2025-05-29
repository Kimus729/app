
import type {NextConfig} from 'next';

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
// GITHUB_REPOSITORY is in format owner/repo. We need 'repo'.
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'app';

const assetPrefixPath = isGithubActions ? `/${repoName}/` : undefined;
const basePathPath = isGithubActions ? `/${repoName}` : undefined;

const nextConfig: NextConfig = {
  output: 'export', // Crucial for static site generation (GitHub Pages)
  assetPrefix: assetPrefixPath, // For CSS, JS files etc.
  basePath: basePathPath,       // For routing and public assets including images
  images: {
    unoptimized: true,      // Serve images as-is, necessary for static exports
    // `images.path` is typically not used or ignored when `unoptimized` is true.
    // `basePath` should handle prefixing for images in the /public directory.
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
};

export default nextConfig;
