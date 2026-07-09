import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  onResetSampleData: () => void;
}

export function Layout({ children, onResetSampleData }: LayoutProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onResetSampleData={onResetSampleData} />
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
