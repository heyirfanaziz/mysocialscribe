/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      // This allows synchronous cookies access
      allowedForwardedHosts: ["*"],
      allowedOrigins: ["*"],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/profile_images/**',
      },
    ],
  },
  // Suppress specific warning messages
  onWarning: (warning) => {
    if (warning.message.includes('cookies()')) {
      return
    }
  },
}

module.exports = nextConfig 