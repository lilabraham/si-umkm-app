// src/components/ui/FeatureCard.tsx
import type { LucideProps } from 'lucide-react';
import type { ElementType } from 'react';

interface FeatureCardProps {
  // Kita terima komponen ikon sebagai prop
  Icon: ElementType<LucideProps>;
  title: string;
  description: string;
}

const FeatureCard = ({ Icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-800 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">
        {description}
      </p>
    </div>
  );
};

export default FeatureCard;