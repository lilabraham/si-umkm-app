# Dockerfile untuk Aplikasi Next.js

# ===== Tahap 1: Instalasi Dependensi =====
# Menggunakan Node.js versi 18-alpine sebagai dasar yang ringan
FROM node:18-alpine AS deps
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package.json package-lock.json ./

# Instal semua dependensi produksi
RUN npm install --production

# ===== Tahap 2: Build Aplikasi =====
FROM node:18-alpine AS builder
WORKDIR /app
# Salin dependensi yang sudah diinstal dari tahap sebelumnya
COPY --from=deps /app/node_modules ./node_modules
# Salin sisa kode aplikasi
COPY . .

# Salin variabel lingkungan dari .env.local untuk proses build
# Di Vercel, variabel ini akan diatur di UI, tapi ini adalah praktik standar
COPY .env.local ./.env.local

# Jalankan skrip build dari Next.js
RUN npm run build

# ===== Tahap 3: Produksi =====
# Ini adalah tahap final yang akan dijalankan di server
FROM node:18-alpine AS runner
WORKDIR /app

# Atur lingkungan ke 'production'
ENV NODE_ENV=production
# Ganti nama server agar tidak menampilkan "Next.js"
ENV NEXT_TELEMETRY_DISABLED 1

# Buat grup dan pengguna 'nextjs' yang tidak memiliki hak root untuk keamanan
RUN addgroup --system --gid 1001 nextjs
RUN adduser --system --uid 1001 nextjs

# Salin folder .next yang sudah di-build dari tahap builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nextjs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Atur agar dijalankan oleh pengguna 'nextjs'
USER nextjs

# Expose port yang digunakan oleh Next.js
EXPOSE 3000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "start"]

