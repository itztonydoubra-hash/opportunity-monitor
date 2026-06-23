/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We use plain JS/JSX. Don't let lint failures block production builds.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
