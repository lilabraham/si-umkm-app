// LOKASI FILE: src/lib/sanitize.ts
// KODE YANG SUDAH DIPERBAIKI (FINAL)

import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;

// PERBAIKAN: Komentar @ts-expect-error dihapus karena tidak ada type error.
const purify = DOMPurify(window);

// Fungsi ini akan menerima sebuah string dan mengembalikan versi bersihnya
export const sanitizeInput = (dirtyInput: string): string => {
  if (!dirtyInput) {
    return '';
  }
  
  // Opsi ini akan menghapus semua tag HTML dan hanya menyisakan teksnya
  const cleanInput = purify.sanitize(dirtyInput, { USE_PROFILES: { html: false } });
  return cleanInput;
};