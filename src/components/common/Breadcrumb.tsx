// LOKASI FILE: src/components/common/Breadcrumb.tsx
import Link from 'next/link';

export interface CrumbItem {
  label: string;
  href?: string; // jika tidak ada href => dianggap aktif (halaman saat ini)
}

interface BreadcrumbProps {
  items: CrumbItem[];
  className?: string;
}

const Breadcrumb = ({ items, className = '' }: BreadcrumbProps) => {
  return (
    <nav aria-label="Breadcrumb" className={`w-full ${className}`}>
      <ol className="flex flex-wrap items-center gap-1 text-sm text-slate-500">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={`${item.label}-${idx}`} className="inline-flex items-center">
              {!isLast && item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-slate-700 hover:underline transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">{item.label}</span>
              )}
              {!isLast && <span className="mx-2 text-slate-300">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
