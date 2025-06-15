import Image from 'next/image';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  seller: string;
  price: number;
  rating: number;
  imageUrl: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const [imgSrc, setImgSrc] = useState(product.imageUrl);
  const fallbackImg = '/placeholder-image.png'; // Pastikan gambar ini ada di folder /public

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-transparent 
                   hover:border-blue-500 hover:scale-[1.02] transition-all duration-300 group">
      
      <div className="overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.name}
          width={400}
          height={300}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgSrc(fallbackImg)}
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-slate-100 truncate">{product.name}</h3>
        <p className="text-sm text-slate-400 mb-3">{product.seller}</p>
        
        <div className="flex justify-between items-center mt-4">
          <p className="text-xl font-semibold text-blue-400">
            Rp{product.price.toLocaleString('id-ID')}
          </p>
          <div className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
            <span className="text-yellow-400">⭐</span>
            <span className="ml-1.5 text-slate-200 font-semibold">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;