/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode:true,
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '**', // Allow all image URLs for development
          }
        ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
}

module.exports = nextConfig