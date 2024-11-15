import { NavLink } from 'react-router-dom';
import { Camera, ListVideo, Moon, Sun } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';
import { Button } from './Button';

export function Navigation() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white border-b border-slate-200 dark:bg-slate-900 dark:border-slate-800">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center space-x-2 text-base font-medium px-3 py-2 rounded-md',
                  'transition-colors hover:text-slate-900 dark:hover:text-slate-100',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  isActive ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400'
                )
              }
            >
              <Camera className="w-5 h-5" />
              <span>Transmissão</span>
            </NavLink>
            <NavLink
              to="/playlist"
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center space-x-2 text-base font-medium px-3 py-2 rounded-md',
                  'transition-colors hover:text-slate-900 dark:hover:text-slate-100',
                  'hover:bg-slate-100 dark:hover:bg-slate-800',
                  isActive ? 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800' : 'text-slate-500 dark:text-slate-400'
                )
              }
            >
              <ListVideo className="w-5 h-5" />
              <span>Playlist</span>
            </NavLink>
          </div>
          <Button
            variant="secondary"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}