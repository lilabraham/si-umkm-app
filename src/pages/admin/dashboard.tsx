// src/pages/admin/dashboard.tsx

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { UploadCloud, XCircle } from 'lucide-react';

const TambahProdukPage = () => {
  // State untuk setiap input form
  const [productName, setProductName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState('');
  const [productImage, setProductImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Ref untuk mengakses input file secara terprogram
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Menangani perubahan pada input file
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      // Membuat URL sementara untuk pratinjau gambar
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Menghapus gambar yang dipilih
  const handleRemoveImage = () => {
    setProductImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file
    }
  };

  // Menangani submit form
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Di sini Anda akan menambahkan logika untuk mengirim data ke API/backend
    const formData = {
      productName,
      storeName,
      price: Number(price),
      productImage,
    };
    console.log('Data yang akan dikirim:', formData);
    alert('Produk berhasil disimpan! (Lihat data di konsol)');
    // Reset form setelah submit (opsional)
    // setProductName(''); setStoreName(''); setPrice(''); handleRemoveImage();
  };

  return (
    <>
      <Head>
        <title>Admin: Tambah Produk Baru - SI-UMKM</title>
      </Head>
      <div className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))] min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
            <p className="text-lg opacity-70 mt-1">Isi detail produk yang akan ditampilkan di halaman utama.</p>
          </header>

          <form onSubmit={handleSubmit} className="bg-[hsl(var(--card))] p-6 sm:p-8 rounded-xl shadow-lg border border-[hsl(var(--border))]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Kolom Input Teks */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium mb-2">Nama Produk</label>
                  <input
                    type="text"
                    id="productName"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full px-4 py-2 bg-[hsl(var(--background))] rounded-md border border-[hsl(var(--border))] focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium mb-2">Nama Toko / Penjual</label>
                  <input
                    type="text"
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-4 py-2 bg-[hsl(var(--background))] rounded-md border border-[hsl(var(--border))] focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium mb-2">Harga Produk</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">Rp</span>
                    <input
                      type="number"
                      id="price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-[hsl(var(--background))] rounded-md border border-[hsl(var(--border))] focus:ring-2 focus:ring-blue-500"
                      placeholder="50000"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Kolom Upload Gambar */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Foto Produk</label>
                <div className="w-full h-full min-h-[200px] border-2 border-dashed border-[hsl(var(--border))] rounded-lg flex flex-col justify-center items-center text-center p-4">
                  {previewUrl ? (
                    <div className="relative w-full max-w-[200px]">
                      <Image src={previewUrl} alt="Pratinjau Gambar" width={200} height={200} className="rounded-md object-contain max-h-48" />
                      <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <XCircle size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <UploadCloud className="mx-auto h-12 w-12 opacity-50" />
                      <p className="opacity-70">Seret & lepas file di sini, atau</p>
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
            
            {/* Tombol Aksi */}
            <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
              <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors">
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