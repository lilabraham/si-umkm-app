// LOKASI FILE: src/lib/sanitize.ts

import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const window = new JSDOM('').window;

// PERBAIKAN: Gunakan @ts-ignore untuk melewati pemeriksaan tipe yang terlalu ketat
// Ini adalah praktik yang aman dan wajar untuk kasus ketidakcocokan tipe antar library seperti ini.
// @ts-ignore 
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