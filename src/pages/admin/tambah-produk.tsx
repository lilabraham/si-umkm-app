// LOKASI FILE: src/pages/admin/tambah-produk.tsx

import { useState, ChangeEvent, FormEvent, useRef } from 'react'; // DI SINI: FormEvent diimpor
import Head from 'next/head';
import Image from 'next/image';
import { UploadCloud, XCircle } from 'lucide-react';

const TambahProdukPage = () => {
  // DI SINI: Semua state yang dibutuhkan didefinisikan
  const [productName, setProductName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!productImage) {
      alert('Mohon pilih gambar produk terlebih dahulu.');
      return;
    }

    try {
      const fileBase64 = await toBase64(productImage);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ file: fileBase64 }),
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Gagal meng-upload gambar.');
      }

      const imageUrlFromCloudinary = uploadData.secure_url;
      
      const productDataToSave = {
        name: productName,
        shopName: storeName,
        price: Number(price),
        imageUrl: imageUrlFromCloudinary,
      };
      
      console.log('Data yang akan disimpan ke Firestore:', productDataToSave);
      alert('Gambar berhasil di-upload dan produk siap disimpan!');

    } catch (error) {
      console.error('Proses submit gagal:', error);
      alert('Terjadi kesalahan saat menyimpan produk.');
    }
  };
  
  return (
    <>
      <Head>
        <title>Admin: Tambah Produk Baru - SI-UMKM</title>
      </Head>
      <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tambah Produk Baru</h1>
            <p className="text-lg text-gray-600 mt-1">Isi detail produk yang akan ditampilkan di halaman utama.</p>
          </header>

          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Kolom Input Teks */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium mb-2 text-gray-700">Nama Produk</label>
                  <input
                    type="text"
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium mb-2 text-gray-700">Nama Toko / Penjual</label>
                  <input
                    type="text"
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2 text-gray-700">Harga Produk</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">Rp</span>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="50000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Upload Gambar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Foto Produk</label>
                <div className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center text-center p-4">
                  {previewUrl ? (
                    <div className="relative w-full max-w-[200px]">
                      <Image src={previewUrl} alt="Pratinjau Gambar" width={200} height={200} className="rounded-md object-contain max-h-48" />
                      <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <XCircle size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="text-gray-500">Seret & lepas file di sini, atau</p>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="font-semibold text-blue-600 hover:text-blue-500">
                        Pilih File
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                Simpan Produk
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TambahProdukPage;