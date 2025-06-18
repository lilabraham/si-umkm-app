// LOKASI FILE: src/components/ui/TrainingCard.tsx

import type { Training } from '@/pages/api/trainings';
import { Calendar, MapPin, Building } from 'lucide-react';
// PERBAIKAN: Impor 'motion' dan tipe 'Variants'
import { motion, type Variants } from 'framer-motion';

// PERBAIKAN: Tambahkan 'variants' ke dalam tipe props
interface TrainingCardProps {
  training: Training;
  variants: Variants;
}

// PERBAIKAN: Terima 'variants' sebagai prop
const TrainingCard = ({ training, variants }: TrainingCardProps) => {
  return (
    // PERBAIKAN: Gunakan prop 'variants' yang diterima dari parent
    <motion.div 
      variants={variants}
      className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full 
                 border border-transparent transition-colors duration-300"
      whileHover={{ scale: 1.03, y: -5, borderColor: "rgba(59, 130, 246, 0.5)", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      
      {/* Konten kartu tidak berubah */}
      <h3 className="text-xl font-semibold text-slate-800 mb-3">
        {training.title}
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-grow">
        {training.description}
      </p>
      <div className="space-y-3 border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} className="text-blue-600" />
          <span>{training.schedule}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} className="text-blue-600" />
          <span>{training.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Building size={16} className="text-blue-600" />
          <span>Oleh: <strong className="font-semibold">{training.organizer}</strong></span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrainingCard;