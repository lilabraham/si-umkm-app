// LOKASI FILE: src/components/ui/TestimonialCard.tsx

import Image from 'next/image';

interface TestimonialProps {
  text: string; author: string; role: string; avatarUrl: string;
}

const TestimonialCard = ({ text, author, role, avatarUrl }: TestimonialProps) => {
  return (
    <div className="bg-[#1E293B] rounded-xl p-6 border border-slate-700/80 h-full flex flex-col
                    transition-all duration-300 ease-in-out hover:bg-slate-800/60 hover:border-slate-600">
      {/* PERBAIKAN: Menggunakan tanda kutip yang aman untuk JSX */}
      <p className="text-slate-300 italic flex-grow">"{text}"</p>
      <div className="flex items-center mt-6 pt-4 border-t border-slate-700/50">
        <Image
          src={avatarUrl} alt={author} width={48} height={48}
          className="rounded-full object-cover"
        />
        <div className="ml-4">
          <p className="font-semibold text-white">{author}</p>
          <p className="text-xs text-yellow-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;