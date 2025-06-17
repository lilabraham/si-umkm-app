// LOKASI FILE: src/pages/dashboard.tsx

import { useState, FormEvent, useEffect, ChangeEvent } from 'react';
import withAuth from "@/components/common/withAuth";
import { useAuth } from "@/context/AuthContext";
import { UploadCloud, Edit, Trash2, X as CloseIcon } from 'lucide-react';

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

  // State untuk form
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [shopName, setShopName] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  // State untuk UI feedback
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State untuk daftar produk
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Fungsi untuk menangani perubahan file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // Batas 2MB
        setMessage({ type: 'error', text: 'Ukuran file tidak boleh lebih dari 2MB.' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => { setImageBase64(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  // Mengambil produk milik pengguna saat halaman dimuat
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

  // Menambah produk baru
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
      if (document.getElementById('imageFile')) {
        (document.getElementById('imageFile') as HTMLInputElement).value = '';
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan.' });
    } finally {
      setLoading(false);
    }
  };

  // Menghapus produk
  const handleDelete = async (productId: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;
    try {
      const response = await fetch(`/api/produk/${productId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Gagal menghapus produk.');
      setMyProducts(prev => prev.filter(p => p.id !== productId));
      setMessage({ type: 'success', text: 'Produk berhasil dihapus.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal menghapus produk.' });
    }
  };

  // Membuka modal edit
  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Mengubah data di form edit
  const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingProduct) return;
    setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
  };

  // Menyimpan perubahan dari form edit
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
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Terjadi kesalahan.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto mt-10 p-4">
        <h1 className="text-3xl font-bold mb-2">Dashboard UMKM</h1>
        <p className="mb-6 text-gray-600">Selamat datang, {currentUser?.email}. Kelola produk Anda di sini.</p>
        
        {/* Form Tambah Produk */}
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mb-16">
          <h2 className="text-2xl font-semibold mb-6">Tambah Produk Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="shopName" className="block text-gray-700 font-medium mb-2">Nama Toko</label>
              <input type="text" id="shopName" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="productName" className="block text-gray-700 font-medium mb-2">Nama Produk</label>
              <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="productPrice" className="block text-gray-700 font-medium mb-2">Harga (Rp)</label>
              <input type="number" id="productPrice" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="productDescription" className="block text-gray-700 font-medium mb-2">Deskripsi Produk</label>
              <textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Foto Produk</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imageBase64 ? <img src={imageBase64} alt="Preview" className="mx-auto h-48 w-auto rounded-md" /> : <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />}
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="imageFile" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none px-1">
                      <span>Unggah file</span>
                      <input id="imageFile" name="imageFile" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-blue-300" disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Produk'}
            </button>
          </form>
          {message.text && <p className={`mt-4 text-center text-sm ${message.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{message.text}</p>}
        </div>

        {/* Daftar Produk */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Daftar Produk Anda</h2>
          {productsLoading ? (
            <p className="text-center text-gray-500">Memuat produk...</p>
          ) : myProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {myProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover"/>
                  <div className="p-4 flex flex-col flex-grow">
                    <p className="text-sm text-gray-500">{product.shopName}</p>
                    <h3 className="text-lg font-bold text-gray-800 flex-grow">{product.name}</h3>
                    <p className="text-xl text-blue-600 font-semibold my-2">Rp {product.price.toLocaleString('id-ID')}</p>
                    <div className="border-t pt-3 mt-auto flex justify-end space-x-2">
                      <button onClick={() => handleOpenEditModal(product)} className="p-2 text-gray-500 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-gray-100 p-8 rounded-lg">
              <p className="font-semibold">Anda belum memiliki produk.</p>
              <p className="text-sm mt-1">Gunakan formulir di atas untuk menambahkan produk pertama Anda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon size={24} /></button>
            <h2 className="text-2xl font-bold mb-6">Edit Produk</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label htmlFor="editShopName" className="block text-sm font-medium text-gray-700">Nama Toko</label>
                <input type="text" name="shopName" id="editShopName" value={editingProduct.shopName} onChange={handleEditFormChange} className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Nama Produk</label>
                <input type="text" name="name" id="editName" value={editingProduct.name} onChange={handleEditFormChange} className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="editPrice" className="block text-sm font-medium text-gray-700">Harga</label>
                <input type="number" name="price" id="editPrice" value={editingProduct.price} onChange={handleEditFormChange} className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea name="description" id="editDescription" value={editingProduct.description} onChange={handleEditFormChange} rows={4} className="mt-1 block w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Batal</button>
                <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Halaman ini HARUS dibungkus dengan withAuth()
export default withAuth(DashboardPage);
