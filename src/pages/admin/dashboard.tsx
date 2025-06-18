// LOKASI FILE: src/pages/admin/dashboard.tsx

import type { GetServerSideProps, NextPage } from 'next';
// PERBAIKAN: Menghapus 'useRouter' yang tidak terpakai
import { useState, FormEvent, ChangeEvent } from 'react';
import { Plus, Edit, Trash2, X as CloseIcon, LogOut } from 'lucide-react';
import type { Training } from '../api/trainings';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardPageProps {
  initialTrainings: Training[];
}

const AdminDashboardPage: NextPage<AdminDashboardPageProps> = ({ initialTrainings }) => {
  // PERBAIKAN: Menghapus 'router' yang tidak terpakai
  // const router = useRouter(); 
  const [trainings, setTrainings] = useState<Training[]>(initialTrainings);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentTraining, setCurrentTraining] = useState<Partial<Training>>({});
  const [csrfToken, setCsrfToken] = useState('');
  const [formError, setFormError] = useState('');
  
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
    } catch (error) {
      // PERBAIKAN: Menggunakan tipe 'unknown' dan melakukan pengecekan
      if (error instanceof Error) {
        alert(error.message || "Gagal memuat form. Silakan coba lagi.");
      } else {
        alert("Gagal memuat form. Silakan coba lagi.");
      }
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
      fetchTrainings();
    } catch (error) {
      // PERBAIKAN: Menggunakan tipe 'unknown' dan melakukan pengecekan
      if (error instanceof Error) {
        setFormError(error.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Yakin ingin menghapus pelatihan ini?")) {
      try {
        await fetch(`/api/trainings/${id}`, { method: 'DELETE' });
        fetchTrainings();
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
                <h1 className="text-lg font-semibold text-slate-900">Admin Dashboard</h1>
                <motion.button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 text-sm text-red-600 font-medium hover:text-red-800 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <LogOut size={16} />
                    Logout
                </motion.button>
            </div>
        </div>
      </header>

      <motion.main 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Manajemen Pelatihan</h2>
          <motion.button 
            onClick={() => openModal('add')} 
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} className="mr-2" /> 
            Tambah Pelatihan
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} className="rounded-xl shadow-md bg-white w-full border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Judul Pelatihan</th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Jadwal</th>
                <th className="text-left text-gray-600 uppercase font-semibold px-4 py-3">Lokasi</th>
                <th className="text-right text-gray-600 uppercase font-semibold px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {trainings.length > 0 ? (
                trainings.map((t, index) => (
                  <motion.tr 
                    key={t.id} 
                    className="hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-800 font-medium">{t.title}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-600">{t.schedule}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-600">{t.location}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-right">
                      <div className="flex justify-end items-center gap-2">
                          <motion.button onClick={() => openModal('edit', t)} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-100 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Edit size={16}/>
                          </motion.button>
                          <motion.button onClick={() => handleDelete(t.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Trash2 size={16}/>
                          </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">Belum ada data pelatihan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.main>
      
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl relative"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full p-1.5 transition" whileTap={{ scale: 0.8 }}><CloseIcon size={20} /></motion.button>
              <h2 className="text-xl font-bold mb-5 text-slate-800">{modalMode === 'add' ? 'Tambah Pelatihan Baru' : 'Edit Pelatihan'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" name="title" placeholder="Judul Pelatihan" value={currentTraining.title || ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" required/>
                  <textarea name="description" placeholder="Deskripsi" value={currentTraining.description || ''} onChange={handleFormChange} rows={4} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none" required></textarea>
                  <input type="text" name="schedule" placeholder="Jadwal (Contoh: Sabtu, 20 Juli 2024)" value={currentTraining.schedule || ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" required/>
                  <input type="text" name="location" placeholder="Lokasi (Contoh: Online via Zoom)" value={currentTraining.location || ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" required/>
                  <input type="text" name="organizer" placeholder="Penyelenggara" value={currentTraining.organizer || ''} onChange={handleFormChange} className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400" required/>
                  <div className="flex justify-end pt-2">
                    <motion.button 
                      type="submit" 
                      className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-md"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >Simpan</motion.button>
                  </div>
                  {formError && (<p className="text-red-600 text-sm text-center mt-2">{formError}</p>)}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async () => { // PERBAIKAN: Menghapus 'context' yang tidak terpakai
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