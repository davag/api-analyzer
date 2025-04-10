/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // For Docker support
  serverExternalPackages: ['js-yaml', 'adm-zip'], // Optimize for packages that don't work well in Edge
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  env: {
    UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
    MAX_UPLOAD_SIZE: process.env.MAX_UPLOAD_SIZE || '10',
    DEBUG: process.env.DEBUG || 'false',
  },
};

export default nextConfig;