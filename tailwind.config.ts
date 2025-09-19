// tailwind.config.js

/** @type {import('tailwindcss').Config} */
const plugins = [];

// ✅ selalu coba aktifkan aspect-ratio (kamu sudah pakai)
try { plugins.push(require('@tailwindcss/aspect-ratio')); } catch {}

// ✅ opsional: aktif kalau paketnya terpasang (tidak bikin error kalau belum ada)
try { plugins.push(require('@tailwindcss/forms')); } catch {}
try { plugins.push(require('@tailwindcss/typography')); } catch {}

module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins,
};
