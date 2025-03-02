/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-other-domain.com', 'lh3.googleusercontent.com', 'another-domain.net'], // Add it here
  },
};

module.exports = nextConfig;  