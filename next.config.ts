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
        // PERBAIKAN DI SINI
        protocol: 'https',             // Diubah dari 'www'
        hostname: 'img.freepik.com',    // Diubah menjadi hostname gambar Freepik
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;