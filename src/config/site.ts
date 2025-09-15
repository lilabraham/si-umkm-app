// LOKASI: src/config/site.ts
// Satu sumber kebenaran untuk identitas situs/wilayah.
// Gunakan ENV agar SSR & client konsisten.
export const SITE_REGION =
  process.env.NEXT_PUBLIC_SITE_REGION?.trim() || 'Randudongkal';

export const SITE_NAME = `SI-UMKM ${SITE_REGION}`;

export const SITE_TAGLINE = `Platform digital untuk membantu pertumbuhan dan daya saing UMKM di Kabupaten ${SITE_REGION} melalui teknologi.`;

export const COPYRIGHT = `${SITE_NAME}. All rights reserved.`;
