/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/sign-in',
          destination: '/sign-in',
        },
        {
          source: '/sign-up',
          destination: '/sign-up',
        },
        {
          source: '/sso-callback',
          destination: '/sso-callback',
        },
      ];
    },
  }


export default nextConfig;