import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export function AdminShell() {
  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AdminSidebar />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminListContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl p-8">
      {children}
    </div>
  );
}
