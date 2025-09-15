import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';

interface Toko {
  id: string;
  name: string;
  imageUrl: string;
  productCount: number;
}

interface TokoCardProps {
  toko: Toko;
  variants?: any;
}

const TokoCard = ({ toko, variants }: TokoCardProps) => {
  const [imgError, setImgError] = useState(false);
  const hasImage = !!toko.imageUrl && !imgError;

  const count =
    typeof toko.productCount === 'number' && !Number.isNaN(toko.productCount)
      ? toko.productCount
      : 0;

  return (
    <motion.div variants={variants} className="h-full">
      <Link
        href={`/toko/${toko.id}`}
        className="group block h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md hover:border-blue-500"
        aria-label={`Lihat toko ${toko.name}`}
      >
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
          {hasImage ? (
            <Image
              src={toko.imageUrl}
              alt={`Gambar toko ${toko.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width:1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
              onError={() => setImgError(true)}
              priority={false}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-slate-300" />
            </div>
          )}
        </div>

        <div className="p-5">
          <h3 className="line-clamp-1 text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600">
            {toko.name}
          </h3>

          <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <ShoppingBag size={14} />
                <span>{count} Produk</span>
              </span>
              <span className="font-semibold text-blue-600 group-hover:underline">
                Lihat Toko →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TokoCard;
