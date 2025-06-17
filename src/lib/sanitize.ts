// src/lib/sanitize.ts

import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

// Kita perlu membuat window object palsu karena DOMPurify berjalan di lingkungan server
const window = new JSDOM('').window;

// PERBAIKAN: Gunakan type casting 'as any' untuk mengatasi masalah kompatibilitas tipe
// antara jsdom dan DOMPurify di lingkungan TypeScript yang lebih baru.
const purify = DOMPurify(window as any);

// Fungsi ini akan menerima sebuah string dan mengembalikan versi bersihnya
export const sanitizeInput = (dirtyInput: string): string => {
  // Tambahkan pengecekan untuk input kosong atau null
  if (!dirtyInput) {
    return '';
  }
  
  // Opsi ini akan menghapus semua tag HTML dan hanya menyisakan teksnya
  const cleanInput = purify.sanitize(dirtyInput, { USE_PROFILES: { html: false } });
  return cleanInput;
};
