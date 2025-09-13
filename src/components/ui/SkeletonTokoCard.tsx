// LOKASI FILE: src/components/ui/SkeletonTokoCard.tsx

import { memo } from 'react';
import { motion } from 'framer-motion';

interface SkeletonTokoCardProps {
  variants?: any;
}

const SkeletonTokoCard = ({ variants }: SkeletonTokoCardProps) => {
  return (
    <motion.div variants={variants} className="h-full">
      <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-[16/9] w-full bg-slate-100">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100" />
        </div>
        <div className="p-5">
          <div className="h-4 w-7/12 rounded bg-slate-200 animate-pulse" />
          <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between">
            <div className="h-3 w-28 rounded bg-slate-200 animate-pulse" />
            <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default memo(SkeletonTokoCard);
