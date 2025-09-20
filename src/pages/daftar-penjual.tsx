// LOKASI FILE: src/pages/daftar-penjual.tsx
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Store } from 'lucide-react';

// normalisasi no WA => hanya digit; jika mulai "0" ubah ke "62"
function normalizeWhatsapp(input: string): string {
  const digits = (input || '').replace(/\D+/g, '');
  if (!digits) return '';
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  return digits;
}

const DaftarPenjualPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: '',
    shopName: '',
    whatsapp: '',
    description: '',
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const validate = () => {
    if (!form.displayName.trim()) return 'Nama Lengkap wajib diisi.';
    if (!form.shopName.trim()) return 'Nama Toko/Usaha wajib diisi.';
    if (!form.whatsapp.trim()) return 'Nomor WhatsApp wajib diisi.';
    const wa = normalizeWhatsapp(form.whatsapp);
    if (wa.length < 10 || wa.length > 15) return 'Nomor WhatsApp tidak valid.';
    if (!form.description.trim()) return 'Deskripsi singkat wajib diisi.';
    if (!form.email.trim()) return 'Email wajib diisi.';
    if (form.password.length < 6) return 'Password minimal 6 karakter.';
    return '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    setOk(false);

    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    try {
      // 1) Buat akun Auth
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);

      // 2) Set nama tampilan ke nama lengkap (agar Navbar menampilkan nama user)
      await updateProfile(user, { displayName: form.displayName });

      // 3) Simpan dokumen user sebagai PENJUAL
      const whatsapp = normalizeWhatsapp(form.whatsapp);
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: form.displayName,   // nama pemilik
        shopName: form.shopName,         // nama toko
        whatsapp,                         // hanya digit, pref 62
        description: form.description,
        role: 'penjual',
        productCount: 0,                 // penting utk kartu toko & export
        createdAt: serverTimestamp(),
      });

      setOk(true);
      // 4) Arahkan ke dashboard penjual
      router.push('/dashboard');
    } catch (e: any) {
      setErr(e?.message?.replace('Firebase: ', '') || 'Gagal mendaftar. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 flex items-center justify-center min-h-screen py-12 px-4">
      <motion.div
        className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex items-center justify-center gap-2 mb-2 text-blue-600">
          <Store className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Pendaftaran Penjual</h1>
        </div>
        <p className="text-center text-gray-500 mb-6">
          Isi data berikut untuk membuka toko Anda di Si-UMKM. Semua kolom wajib diisi.
        </p>

        {!ok ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Lengkap Anda
              </label>
              <input
                name="displayName"
                value={form.displayName}
                onChange={onChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Budi Santoso"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nama Toko / Usaha
              </label>
              <input
                name="shopName"
                value={form.shopName}
                onChange={onChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Warung Bakso Pak Kumis"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nomor WhatsApp Aktif
              </label>
              <input
                name="whatsapp"
                value={form.whatsapp}
                onChange={onChange}
                required
                inputMode="tel"
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: 081234567890"
              />
              <p className="text-xs text-gray-500 mt-1">
                Kami simpan dalam format internasional (contoh: 62812xxxxxxx).
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deskripsi Singkat Usaha
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                required
                rows={3}
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Jelaskan produk/jasa utama yang Anda jual…"
              />
            </div>

            <hr className="my-1" />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email untuk Login
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={onChange}
                required
                className="mt-1 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Minimal 6 karakter"
              />
            </div>

            {err && (
              <div className="p-3 bg-red-100 text-red-700 border border-red-200 rounded-md flex items-center gap-3 text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{err}</span>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Memproses…' : 'Daftar sebagai Penjual'}
            </motion.button>

            <p className="text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                Login di sini
              </Link>
            </p>
          </form>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Pendaftaran Berhasil!</h2>
            <p className="mt-2 text-gray-600">
              Akun penjual Anda sudah aktif. Anda akan diarahkan ke dashboard.
            </p>
            <Link
              href="/dashboard/index"
              className="mt-6 inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Buka Dashboard Sekarang
            </Link>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DaftarPenjualPage;
