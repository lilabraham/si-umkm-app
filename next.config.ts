/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
        port: '',
        pathname: '/**',
      },
      // ==========================================================
      // PERUBAHAN DI SINI: Menambahkan konfigurasi untuk placehold.co
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      { // <-- TAMBAHKAN BLOK INI
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
      // ==========================================================
    ],
  },
};

module.exports = nextConfig;