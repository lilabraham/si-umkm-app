// LOKASI FILE: src/components/ui/SkeletonProductCard.tsx

import { memo } from 'react';
import { motion } from 'framer-motion';

interface SkeletonProductCardProps {
  variants?: any;      // biar bisa dipakai di motion grid
  className?: string;  // opsional untuk override
}

const SkeletonProductCard = ({ variants, className = '' }: SkeletonProductCardProps) => {
  return (
    <motion.div variants={variants} className={`h-full ${className}`}>
      <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Gambar */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
        </div>

        {/* Konten */}
        <div className="p-4">
          {/* (opsional) nama toko tipis */}
          <div className="mb-2 h-3 w-24 rounded bg-slate-200 animate-pulse" />

          {/* Nama produk 2 baris */}
          <div className="space-y-2">
            <div className="h-3 w-9/12 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-6/12 rounded bg-slate-200 animate-pulse" />
          </div>

          {/* Harga + rating spot */}
          <div className="mt-3 flex items-center justify-between">
            <div className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-16 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(SkeletonProductCard);
