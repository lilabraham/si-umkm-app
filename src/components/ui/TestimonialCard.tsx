// src/components/ui/TestimonialCard.tsx

import Image from 'next/image';

interface TestimonialProps {
  text: string;
  author: string;
  role: string;
  avatarUrl: string;
}

const TestimonialCard = ({ text, author, role, avatarUrl }: TestimonialProps) => {
  return (
    <div className="bg-white-800 p-8 rounded-lg border border-slate-700/50 h-full flex flex-col">
      <p className="text-slate-300 italic flex-grow">"{text}"</p>
      <div className="flex items-center mt-6">
        <Image
          src={avatarUrl}
          alt={author}
          width={48}
          height={48}
          className="rounded-full object-cover"
        />
        <div className="ml-4">
          <p className="font-bold text-slate-100">{author}</p>
          <p className="text-sm text-blue-400">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;