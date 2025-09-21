/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.freepik.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' }, // Google avatar
    ],
  },

  // Redirect permanen agar link lama /daftar-penjual tetap aman
  async redirects() {
    return [
      {
        source: '/daftar-penjual',
        destination: '/register?role=penjual',
        permanent: true, // 308
      },
    ];
  },
};

module.exports = nextConfig;
