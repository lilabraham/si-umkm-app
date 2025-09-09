// LOKASI FILE: src/components/ui/TokoCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Tipe data untuk sebuah Toko
interface Toko {
  id: string; // Ini akan digunakan untuk URL, contoh: "bakso-pak-kumis"
  name: string;
  imageUrl: string; // Gambar pemanis untuk toko
}

// Properti untuk varian animasi dari Framer Motion
interface TokoCardProps {
  toko: Toko;
  variants: any;
}

const TokoCard = ({ toko, variants }: TokoCardProps) => {
  return (
    <motion.div variants={variants}>
      <Link href={`/toko/${toko.id}`} className="block group">
        <div className="relative overflow-hidden rounded-lg shadow-md aspect-w-16 aspect-h-9">
          <Image
            src={toko.imageUrl}
            alt={`Gambar untuk ${toko.name}`}
            fill
            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-blue-600">
            {toko.name}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
};

export default TokoCard;