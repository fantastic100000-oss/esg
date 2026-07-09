import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export function Card({ children, className = '', title, subtitle }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && <h3 className="text-sm font-semibold text-slate-700">{title}</h3>}
      {subtitle && <p className="mb-3 text-xs text-slate-400">{subtitle}</p>}
      {children}
    </div>
  );
}
