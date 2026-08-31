/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true, // Bypasses Vercel image optimization transformations to prevent credit consumption
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
