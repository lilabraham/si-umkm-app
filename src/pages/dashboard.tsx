// LOKASI FILE: src/pages/dashboard.tsx

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import withAuth from "@/components/common/withAuth";
import { useAuth } from "@/context/AuthContext";
import { UploadCloud, Edit, Trash2, X as CloseIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: string; 
  name: string; 
  price: number; 
  description: string; 
  shopName: string; 
  imageUrl: string; 
  ownerId: string;
}

function DashboardPage() {
  const { currentUser } = useAuth();
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [shopName, setShopName] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file tidak boleh lebih dari 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setImageBase64(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (currentUser) {
      const fetchMyProducts = async () => {
        setProductsLoading(true);
        try {
          const response = await fetch('/api/produk');
          if (!response.ok) throw new Error('Gagal mengambil data produk');
          const allProducts: Product[] = await response.json();
          const userProducts = allProducts.filter(p => p.ownerId === currentUser.uid);
          setMyProducts(userProducts);
        } catch (error) {
          console.error("Gagal mengambil produk:", error);
        } finally {
          setProductsLoading(false);
        }
      };
      fetchMyProducts();
    }
  }, [currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (!productName || !productPrice || !productDescription || !shopName || !imageBase64) {
      setMessage({ type: 'error', text: 'Semua kolom, termasuk foto, wajib diisi.' });
      return;
    }
    if (!currentUser) return;
    setLoading(true);
    try {
      const productData = { name: productName, price: parseFloat(productPrice), description: productDescription, shopName: shopName, imageUrl: imageBase64, ownerId: currentUser.uid };
      const response = await fetch('/api/produk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Gagal menambahkan produk.');
      const newProduct = await response.json();
      setMessage({ type: 'success', text: `Produk "${newProduct.name}" berhasil ditambahkan!` });
      setMyProducts(prev => [newProduct, ...prev]);
      setProductName(''); setProductPrice(''); setProductDescription(''); setShopName(''); setImageBase64(null);
      const imageFileInput = document.getElementById('imageFile') as HTMLInputElement;
      if (imageFileInput) {
        imageFileInput.value = '';
      }
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const response = await fetch(`/api/produk/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus produk.');
      setMyProducts(prev => prev.filter(p => p.id !== productId));
      setMessage({ type: 'success', text: 'Produk berhasil dihapus.' });
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message || 'Gagal menghapus produk.' });
      }
    }
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setLoading(true);
    try {
      const { id, ...updateData } = editingProduct;
      const response = await fetch(`/api/produk/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error("Gagal memperbarui produk.");
      const updatedProduct = await response.json();
      setMyProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      setIsEditModalOpen(false);
      setMessage({ type: 'success', text: 'Produk berhasil diperbarui!' });
    } catch (error) {
      if (error instanceof Error) {
        setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  } as const;


  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-800">Dashboard UMKM</h1>
          <p className="text-slate-500">Selamat datang, {currentUser?.email}. Kelola produk Anda di sini.</p>
        </motion.div>
        
        <motion.div 
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white shadow-md rounded-xl p-6 h-fit sticky top-24">
              <h2 className="text-xl font-semibold mb-4 text-slate-800">Tambah Produk Baru</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="shopName" className="text-sm font-medium text-gray-700 mb-1 block">Nama Toko</label>
                  <input type="text" id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
                </div>
                <div>
                  <label htmlFor="productName" className="text-sm font-medium text-gray-700 mb-1 block">Nama Produk</label>
                  <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
                </div>
                <div>
                  <label htmlFor="productPrice" className="text-sm font-medium text-gray-700 mb-1 block">Harga (Rp)</label>
                  <input type="number" id="productPrice" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition" required />
                </div>
                <div>
                  <label htmlFor="productDescription" className="text-sm font-medium text-gray-700 mb-1 block">Deskripsi Produk</label>
                  <textarea id="productDescription" value={productDescription} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setProductDescription(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition resize-none" required></textarea>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Foto Produk</label>
                  <label htmlFor="imageFile" className="relative cursor-pointer bg-white hover:bg-slate-50 transition-colors border-2 border-dashed border-gray-300 p-6 text-center text-gray-500 rounded-md flex flex-col items-center justify-center">
                      {imageBase64 ? <div className="relative w-full h-40"><Image src={imageBase64} alt="Preview Produk" layout="fill" objectFit="contain" className="rounded-md" /></div> : <><UploadCloud className="w-10 h-10 text-gray-400 mb-2" /><span className="text-sm">Klik untuk memilih</span><span className="text-xs mt-1">PNG, JPG (maks. 2MB)</span></>}
                  </label>
                  <input id="imageFile" name="imageFile" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </div>
                <motion.button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {loading ? <Loader2 className="animate-spin"/> : 'Simpan Produk'}
                </motion.button>
              </form>
              {message.text && <p className={`mt-4 text-center text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-3">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Daftar Produk Anda</h2>
            {productsLoading ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-500" size={32}/></div>
            ) : myProducts.length > 0 ? (
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" variants={containerVariants}>
                {myProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants} className="rounded-xl bg-white shadow-md p-4 flex flex-col">
                    <div className='relative w-full h-32 mb-3'>
                        <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="cover" className="rounded-md" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-sm font-medium text-slate-800 truncate">{product.name}</h3>
                        <p className="text-sm font-medium text-blue-600">Rp {product.price.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="border-t mt-3 pt-2 flex justify-end space-x-1">
                      <motion.button onClick={() => handleOpenEditModal(product)} className="p-1.5 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors" whileHover={{scale: 1.1}} whileTap={{scale: 0.9}}><Edit size={16} /></motion.button>
                      <motion.button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" whileHover={{scale: 1.1}} whileTap={{scale: 0.9}}><Trash2 size={16} /></motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center text-gray-500 bg-white p-8 rounded-xl shadow-sm">
                 <ImageIcon size={40} className="mx-auto text-gray-400 mb-4" />
                <p className="font-semibold text-gray-700">Anda belum memiliki produk.</p>
                <p className="text-sm mt-1">Gunakan formulir di samping untuk menambahkan produk pertama Anda.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
              <motion.button onClick={() => setIsEditModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full p-1.5 transition" whileTap={{scale: 0.8}}><CloseIcon size={20} /></motion.button>
              <h2 className="text-xl font-bold mb-5">Edit Produk</h2>
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label htmlFor="editShopName" className="block text-sm font-medium text-gray-700">Nama Toko</label>
                  <input type="text" name="shopName" id="editShopName" value={editingProduct.shopName} onChange={handleEditFormChange} className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                  <input type="text" name="name" id="editName" value={editingProduct.name} onChange={handleEditFormChange} className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700">Harga</label>
                  <input type="number" name="price" id="editPrice" value={editingProduct.price} onChange={handleEditFormChange} className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                  <textarea name="description" id="editDescription" value={editingProduct.description} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleEditFormChange(e)} rows={4} className="mt-1 w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none"></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <motion.button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors" whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>Batal</motion.button>
                  <motion.button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400" disabled={loading} whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
                    {loading ? <Loader2 className="animate-spin"/> : 'Simpan Perubahan'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default withAuth(DashboardPage);