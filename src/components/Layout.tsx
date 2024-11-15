import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <footer className="container mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
        © Miguel Kallemback {new Date().getFullYear()}. Todos os direitos reservados.
      </footer>
    </div>
  );
}