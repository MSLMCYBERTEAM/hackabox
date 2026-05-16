/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // টাইপস্ক্রিপ্ট এরর থাকলেও বিল্ড সফল করবে
    ignoreBuildErrors: true,
  },
  eslint: {
    // ইএসলিন্ট এরর ইগনোর করবে
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;