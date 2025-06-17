// src/pages/pelatihan.tsx

import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { Calendar, MapPin, Building } from 'lucide-react';
// Impor tipe data Training dari API kita
import type { Training } from './api/trainings';

interface PelatihanPageProps {
  trainings: Training[];
}

const PelatihanPage: NextPage<PelatihanPageProps> = ({ trainings }) => {
  return (
    <>
      <Head>
        <title>Program Pelatihan - Si-UMKM</title>
        <meta name="description" content="Akses informasi dan jadwal program pembinaan untuk UMKM dari pemerintah." />
      </Head>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900">
              Program Pelatihan & Pembinaan UMKM
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Tingkatkan skala bisnis Anda dengan mengikuti program-program pilihan yang diselenggarakan oleh pemerintah dan mitra.
            </p>
          </div>

          {trainings.length > 0 ? (
            <div className="space-y-8 max-w-4xl mx-auto">
              {trainings.map((training) => (
                <div key={training.id} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{training.title}</h2>
                  <p className="text-gray-600 leading-relaxed mb-6">{training.description}</p>
                  
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center text-gray-700">
                      <Calendar size={20} className="text-blue-600 mr-3" />
                      <span>{training.schedule}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <MapPin size={20} className="text-blue-600 mr-3" />
                      <span>{training.location}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Building size={20} className="text-blue-600 mr-3" />
                      <span>Diselenggarakan oleh: <strong>{training.organizer}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-white p-10 rounded-lg shadow-md">
              <p>Belum ada jadwal pelatihan yang tersedia saat ini. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Fungsi ini berjalan di server saat build time untuk mengambil data pelatihan
export const getStaticProps: GetStaticProps = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trainings`);
    if (!res.ok) {
      throw new Error('Gagal mengambil data pelatihan');
    }
    const trainings: Training[] = await res.json();

    // Mengurutkan pelatihan berdasarkan tanggal pembuatan (jika ada)
    // Asumsi 'createdAt' adalah objek timestamp dari Firestore
    const sortedTrainings = trainings.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; // Terbaru di atas
    });

    return {
      props: {
        trainings: sortedTrainings,
      },
      // Halaman akan coba dibuat ulang setiap 60 detik jika ada request baru
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error di getStaticProps (pelatihan.tsx):", error);
    return {
      props: {
        trainings: [],
      },
    };
  }
};

export default PelatihanPage;
