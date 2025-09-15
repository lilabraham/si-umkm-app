// LOKASI FILE: src/components/ui/ProductCard.tsx

import { useState, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Star, Image as ImageIcon, Tag } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  price: number;
  shopName?: string;
  imageUrl?: string;
  rating?: number;
  category?: string;
  // tambahkan field lain bila perlu, tidak dipakai di UI ini
}

interface ProductCardProps {
  product: Product;
  variants?: any;                    // untuk framer-motion grid
  variant?: 'default' | 'compact';   // kompatibel dengan pemanggilanmu sebelumnya
  isClickable?: boolean;             // opsional, default true
}

const formatPriceIDR = (n: number) =>
  typeof n === 'number'
    ? `Rp ${n.toLocaleString('id-ID')}`
    : '';

const StarRatingMini = ({ rating = 0 }: { rating?: number }) => {
  const r = Math.round(rating);
  return (
    <div className="inline-flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={12}
          className={i < r ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );
};

const CardContent = ({
  product,
  imgError,
  setImgError,
  variant,
}: {
  product: Product;
  imgError: boolean;
  setImgError: (b: boolean) => void;
  variant: 'default' | 'compact';
}) => {
  return (
    <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition group-hover:shadow-md group-hover:border-blue-500">
      {/* Badge kategori kecil (opsional) di atas gambar */}
      {product.category && (
        <div className="absolute z-10 m-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] text-slate-700 border border-slate-200">
          <Tag size={10} />
          {product.category}
        </div>
      )}

      {/* Gambar */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {product.imageUrl && !imgError ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
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

      {/* Konten */}
      <div className={`p-4 ${variant === 'compact' ? 'pb-4' : 'pb-5'}`}>
        {/* Nama toko (opsional, tipis) */}
        {product.shopName && (
          <p className="text-[11px] font-medium text-blue-600/90 mb-1 line-clamp-1">
            {product.shopName}
          </p>
        )}

        {/* Nama produk */}
        <h3 className="text-slate-900 text-sm sm:text-base font-semibold line-clamp-2">
          {product.name}
        </h3>

        {/* Harga + rating ringkas */}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-slate-900 font-bold text-sm sm:text-base">
            {formatPriceIDR(product.price)}
          </span>
          {typeof product.rating === 'number' && product.rating > 0 && (
            <div className="text-xs text-slate-600">
              <StarRatingMini rating={product.rating} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductCard = ({ product, variants, variant = 'default', isClickable = true }: ProductCardProps) => {
  const [imgError, setImgError] = useState(false);

  const body = (
    <CardContent
      product={product}
      imgError={imgError}
      setImgError={setImgError}
      variant={variant}
    />
  );

  return (
    <motion.div variants={variants} className="h-full">
      {isClickable ? (
        <Link
          href={`/produk/${product.id}`}
          className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl"
          aria-label={`Lihat produk ${product.name}`}
        >
          <span className="block">{body}</span>
        </Link>
      ) : (
        <div className="group h-full">{body}</div>
      )}
    </motion.div>
  );
};

export default memo(ProductCard);
