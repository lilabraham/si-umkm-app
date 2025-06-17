// LOKASI FILE: src/pages/admin/dashboard.tsx

import type { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { Plus, Edit, Trash2, X as CloseIcon } from 'lucide-react';
import type { Training } from '../api/trainings';

// Tipe untuk props yang akan diterima dari getServerSideProps
interface AdminDashboardPageProps {
  initialTrainings: Training[];
}

const AdminDashboardPage: NextPage<AdminDashboardPageProps> = ({ initialTrainings }) => {
  const router = useRouter();
  
  // State untuk data pelatihan sekarang diinisialisasi dari props, bukan dari fetch di client
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);

  // State untuk modal dan form (tidak berubah)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentTraining, setCurrentTraining] = useState<Partial<Training>>({});
  const [csrfToken, setCsrfToken] = useState('');
  const [formError, setFormError] = useState('');
  
  // Fungsi untuk mengambil ulang data setelah ada perubahan (untuk refresh)
  const fetchTrainings = async () => {
    try {
      const res = await fetch('/api/trainings');
      const data = await res.json();
      setTrainings(data);
    } catch (error) {
      console.error("Gagal mengambil data pelatihan:", error);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('isAdminLoggedIn');
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  const openModal = async (mode: 'add' | 'edit', training?: Training) => {
    setFormError('');
    try {
      const res = await fetch('/api/admin/csrf-token');
      if (!res.ok) throw new Error('Gagal mendapatkan token keamanan');
      const data = await res.json();
      setCsrfToken(data.csrfToken);
      setModalMode(mode);
      setCurrentTraining(mode === 'add' ? {} : training || {});
      setIsModalOpen(true);
    } catch (error: any) {
      alert(error.message || "Gagal memuat form. Silakan coba lagi.");
    }
  };
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCurrentTraining({ ...currentTraining, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    const url = modalMode === 'add' ? '/api/trainings' : `/api/trainings/${currentTraining.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    const body = JSON.stringify({ ...currentTraining, csrfToken });

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Terjadi kesalahan pada server.');
      }
      setIsModalOpen(false);
      fetchTrainings(); // Panggil fetchTrainings untuk refresh data di tabel
    } catch (error: any) {
      setFormError(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus pelatihan ini?")) {
      try {
        await fetch(`/api/trainings/${id}`, { method: 'DELETE' });
        fetchTrainings(); // Panggil fetchTrainings untuk refresh data di tabel
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
              Logout
            </button>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Manajemen Pelatihan</h2>
            <button onClick={() => openModal('add')} className="flex items-center bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">
              <Plus size={20} className="mr-2" /> Tambah Pelatihan
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Judul</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jadwal</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lokasi</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100"></th>
                </tr>
              </thead>
              <tbody>
                {trainings.length > 0 ? (
                  trainings.map(t => (
                    <tr key={t.id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{t.title}</p></td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{t.schedule}</p></td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm"><p className="text-gray-900 whitespace-no-wrap">{t.location}</p></td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-right">
                        <button onClick={() => openModal('edit', t)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="text-center py-4">Belum ada data pelatihan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"><CloseIcon size={24} /></button>
            <h2 className="text-2xl font-bold mb-6">{modalMode === 'add' ? 'Tambah' : 'Edit'} Pelatihan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="title" placeholder="Judul Pelatihan" value={currentTraining.title || ''} onChange={handleFormChange} className="w-full px-4 py-2 border rounded-lg" required/>
              <textarea name="description" placeholder="Deskripsi" value={currentTraining.description || ''} onChange={handleFormChange} rows={4} className="w-full px-4 py-2 border rounded-lg" required></textarea>
              <input type="text" name="schedule" placeholder="Jadwal (Contoh: Sabtu, 20 Juli 2024)" value={currentTraining.schedule || ''} onChange={handleFormChange} className="w-full px-4 py-2 border rounded-lg" required/>
              <input type="text" name="location" placeholder="Lokasi (Contoh: Online via Zoom)" value={currentTraining.location || ''} onChange={handleFormChange} className="w-full px-4 py-2 border rounded-lg" required/>
              <input type="text" name="organizer" placeholder="Penyelenggara" value={currentTraining.organizer || ''} onChange={handleFormChange} className="w-full px-4 py-2 border rounded-lg" required/>
              <div className="flex justify-end pt-4"><button type="submit" className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Simpan</button></div>
              {formError && (<p className="text-red-600 text-sm text-center mt-2">{formError}</p>)}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

// Fungsi BARU: getServerSideProps untuk implementasi SSR
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trainings`);
    if (!res.ok) {
      return { props: { initialTrainings: [] } };
    }
    const trainings: Training[] = await res.json();
    const sortedTrainings = trainings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    return {
      props: {
        initialTrainings: sortedTrainings,
      },
    };
  } catch (error) {
    console.error("Error di getServerSideProps (admin/dashboard):", error);
    return {
      props: {
        initialTrainings: [],
      },
    };
  }
};

export default AdminDashboardPage;
