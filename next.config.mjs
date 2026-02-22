/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [new URL("https://avatars.githubusercontent.com/u/**?v=4")],
  },
};

export default nextConfig;
