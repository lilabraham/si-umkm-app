// LOKASI FILE: src/pages/pelatihan.tsx

import type { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import TrainingCard from '@/components/ui/TrainingCard';
import type { Training } from './api/trainings';
import { Info } from 'lucide-react';
import { motion } from 'framer-motion'; // PERBAIKAN: Menghapus 'type Variants' yang tidak terpakai

interface PelatihanPageProps {
  trainings: Training[];
}

const PelatihanPage: NextPage<PelatihanPageProps> = ({ trainings }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  } as const;

  return (
    <>
      <Head>
        <title>Program Pelatihan - Si-UMKM</title>
        <meta name="description" content="Akses informasi dan jadwal program pembinaan untuk UMKM dari pemerintah." />
      </Head>

      <motion.div 
        className="bg-gray-50 min-h-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              Program Pelatihan & Pembinaan UMKM
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Tingkatkan skala bisnis Anda dengan mengikuti program-program pilihan yang diselenggarakan oleh pemerintah dan mitra.
            </p>
          </div>

          {trainings.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {trainings.map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  variants={cardVariants}
                />
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 bg-white p-10 rounded-xl shadow-sm max-w-md mx-auto">
               <Info size={40} className="mx-auto text-blue-500 mb-4" />
              <h3 className="font-semibold text-lg text-gray-700">Belum Ada Jadwal</h3>
              <p className="mt-1 text-sm">Jadwal pelatihan belum tersedia saat ini. Silakan cek kembali nanti.</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => { // PERBAIKAN: Menghapus 'context' yang tidak terpakai
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trainings`);
    if (!res.ok) {
      throw new Error('Gagal mengambil data pelatihan');
    }
    const trainings: Training[] = await res.json();
    const sortedTrainings = trainings.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
    });
    return {
      props: {
        trainings: sortedTrainings,
      },
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