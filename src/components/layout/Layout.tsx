import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />

      <main className="
        flex-1 min-w-0
        px-5 py-6
        lg:px-10 lg:py-8
        pb-24 lg:pb-10
      ">
        {/* Max width container — slightly wider for breathing room */}
        <div className="max-w-[900px] mx-auto">
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  );
}