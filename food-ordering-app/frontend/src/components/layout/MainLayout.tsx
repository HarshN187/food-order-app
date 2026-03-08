import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
