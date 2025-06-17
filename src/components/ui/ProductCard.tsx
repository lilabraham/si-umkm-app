// src/components/ui/ProductCard.tsx

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

// PERBAIKAN: Tipe data disesuaikan dengan seluruh aplikasi
interface Product {
  id: string; // ID dari Firestore adalah string
  name: string;
  shopName: string; // Menggunakan shopName, bukan seller
  price: number;
  rating?: number; // Rating dibuat opsional
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Logika untuk fallback image sudah bagus, kita pertahankan
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const fallbackImg = 'https://placehold.co/600x400/EEE/31343C?text=Gambar+Rusak';

  return (
    // PERBAIKAN: Seluruh kartu dibungkus dengan Link untuk navigasi
    <Link href={`/produk/${product.id}`} className="block h-full">
      <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg shadow-md overflow-hidden flex flex-col h-full 
                     border border-[hsl(var(--border))]
                     transition-all duration-300 group
                     hover:scale-[1.03] hover:shadow-xl hover:border-[hsl(var(--primary))]">
        
        <div className="overflow-hidden relative h-52">
          <Image
            src={imgSrc}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgSrc(fallbackImg)}
            sizes="(max-width: 768px) 100vw, 50vw, 33vw"
          />
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold truncate" title={product.name}>
            {product.name}
          </h3>
          {/* PERBAIKAN: Menggunakan product.shopName */}
          <p className="text-sm text-[hsl(var(--foreground))] opacity-70 mb-4 leading-relaxed">{product.shopName}</p>
          
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-[hsl(var(--border))]">
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Rp{product.price.toLocaleString('id-ID')}
            </p>
            {/* Menampilkan rating hanya jika ada */}
            {product.rating && (
              <div className="flex items-center text-sm">
                <span className="text-yellow-500">⭐</span>
                <span className="ml-1.5 font-semibold">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* Tombol "Lihat Detail" tidak diperlukan lagi karena seluruh kartu bisa diklik */}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
