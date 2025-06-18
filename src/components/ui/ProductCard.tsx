// LOKASI FILE: src/components/ui/ProductCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react'; // PERBAIKAN: Impor useEffect
import { Star, Store, ImageIcon } from 'lucide-react'; // PERBAIKAN: Impor ImageIcon untuk placeholder
import { motion, type Variants } from 'framer-motion';

// Interface tetap sama
interface Product {
  id: string; name: string; shopName: string; price: number; rating?: number; imageUrl: string;
}
interface ProductCardProps {
  product: Product;
  variants?: Variants;
  variant?: 'default' | 'compact';
}

const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
    }).format(price);
};

const ProductCard = ({ product, variants, variant = 'default' }: ProductCardProps) => {
  // PERBAIKAN UTAMA:
  // 1. `imgSrc` di-set null pada awalnya.
  // 2. `isLoading` ditambahkan untuk menampilkan placeholder.
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fallbackImg = 'https://placehold.co/600x400/EEE/31343C?text=Gagal+Muat';

  // 3. useEffect akan berjalan di sisi client untuk mengambil URL gambar.
  // Ini menyelesaikan masalah 'large-page-data' TANPA menghilangkan gambar.
  useEffect(() => {
    const fetchImage = async () => {
      setIsLoading(true);
      try {
        // Kita panggil API untuk satu produk saja untuk mendapatkan imageUrl
        const res = await fetch(`/api/produk/${product.id}`);
        if (!res.ok) throw new Error('Gagal mengambil gambar');
        const fullProductData: Product = await res.json();
        
        if (fullProductData.imageUrl) {
          setImgSrc(fullProductData.imageUrl);
        } else {
          setImgSrc(fallbackImg);
        }
      } catch (error) {
        console.error("Gagal fetch gambar produk:", error);
        setImgSrc(fallbackImg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImage();
  }, [product.id]); // Akan berjalan setiap kali ID produk berubah

  const isCompact = variant === 'compact';

  return (
    <Link href={`/produk/${product.id}`} className="block group" aria-label={`Lihat detail untuk ${product.name}`}>
      <motion.div
        variants={variants}
        className={`rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out 
          ${isCompact 
            ? 'bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:scale-[1.02]' 
            : 'bg-card text-card-foreground border-border hover:shadow-lg'}`
        }
        whileHover={!isCompact ? { scale: 1.03, y: -5 } : {}}
        whileTap={!isCompact ? { scale: 0.98 } : {}}
      >
        {/* PERBAIKAN: Tampilkan skeleton/placeholder saat gambar sedang dimuat */}
        <div className={`overflow-hidden relative ${isCompact ? 'h-40' : 'h-48'} ${isLoading ? 'bg-slate-200 animate-pulse' : ''}`}>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="text-slate-400" size={40} />
            </div>
          ) : (
            <Image
              src={imgSrc || fallbackImg} alt={product.name} fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgSrc(fallbackImg)}
              sizes="(max-width: 768px) 100vw, 50vw, 33vw"
            />
          )}
        </div>

        {/* Sisa konten tidak berubah, hanya datanya yang sekarang lengkap */}
        <div className={`p-4 flex flex-col flex-grow ${isCompact ? 'bg-white' : 'bg-card'}`}>
          {!isCompact && (
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 mb-2">
              <Store size={14} />
              {product.shopName}
            </p>
          )}
          <h3 className={`font-semibold leading-snug truncate group-hover:text-primary transition-colors ${isCompact ? 'text-lg text-slate-800' : 'text-base text-card-foreground'}`} title={product.name}>
            {product.name}
          </h3>
          <div className="flex-grow" />
          <div className={`flex justify-between items-end mt-2 pt-2 ${isCompact ? '' : 'border-t border-border/80'}`}>
            <p className={`font-bold ${isCompact ? 'text-sm text-yellow-600' : 'text-lg text-primary'}`}>
              {formatCurrency(product.price)}
            </p>
            {product.rating && !isCompact && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                <Star size={14} className="text-amber-500 fill-current" />
                <span className="text-xs font-bold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;