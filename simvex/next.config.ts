import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/drone-simulator',
        destination: '/viewer/drone-combined?tab=sim',
        permanent: false,
      },
      {
        source: '/robot-arm',
        destination: '/viewer/robot-arm-combined?tab=sim',
        permanent: false,
      },
      {
        source: '/jet-engine',
        destination: '/viewer/jet-engine?tab=sim',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
