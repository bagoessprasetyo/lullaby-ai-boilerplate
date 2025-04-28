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
};

export default nextConfig;
