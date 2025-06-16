// src/components/ui/ProductCard.tsx

import Image from 'next/image';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  seller: string;
  price: number;
  rating: number;
  imageUrl: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const fallbackImg = '/placeholder-image.png';

  return (
    <div className="bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] rounded-lg shadow-md overflow-hidden flex flex-col h-full 
                   border border-[hsl(var(--border))] /* DIUBAH: Border adaptif */
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
        <p className="text-sm text-[hsl(var(--foreground))] opacity-70 mb-4 leading-relaxed">{product.seller}</p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-[hsl(var(--border))]"> {/* DIUBAH */}
          <p className="text-xl font-semibold text-blue-600 dark:text-blue-400"> {/* DIUBAH */}
            Rp{product.price.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center text-sm">
            <span className="text-yellow-500">⭐</span> {/* DIUBAH */}
            <span className="ml-1.5 font-semibold">{product.rating.toFixed(1)}</span>
          </div>
        </div>
        
        <button className="mt-4 w-full bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-md 
                         hover:bg-blue-700 transition-colors duration-200">
          <span className="flex items-center justify-center gap-2">
            Lihat Detail <ArrowRight size={16} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;