// LOKASI FILE: src/components/ui/TokoCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Image as ImageIcon } from 'lucide-react';

// Tipe data untuk Toko
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
  return (
    <motion.div variants={variants} className="h-full">
      <Link href={`/toko/${toko.id}`} className="block group bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-500 transition-all duration-300 h-full flex flex-col">
        
        <div className="relative overflow-hidden rounded-t-xl aspect-w-16 aspect-h-9">
          {toko.imageUrl ? (
            <Image
              src={toko.imageUrl} // Membaca properti imageUrl
              alt={`Gambar untuk ${toko.name}`}
              fill
              className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-slate-300" />
            </div>
          )}
        </div>

        <div className="p-5 flex-grow flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600 flex-grow">
            {toko.name}
          </h3>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={14} />
              <span>{toko.productCount} Produk</span>
            </div>
            <span className="font-semibold text-blue-600 group-hover:underline">Lihat Toko →</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default TokoCard;