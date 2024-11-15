import { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../lib/utils';

export function InfoPanel() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={cn(
          'p-2 rounded-full transition-colors',
          'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
          'hover:bg-slate-100 dark:hover:bg-slate-800',
          isVisible && 'text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800'
        )}
      >
        <Info className="w-5 h-5" />
      </button>

      {isVisible && (
        <div className="absolute right-0 top-12 w-80 p-4 rounded-lg shadow-lg z-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Como funciona?
          </h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>
              O TurboCam Studio utiliza tecnologia WebRTC para transmissão em tempo real com latência ultra baixa.
            </p>
            <p>
              Configure sua câmera e microfone, ajuste as opções de áudio conforme necessário e clique em 
              "Iniciar Transmissão" para começar.
            </p>
            <p>
              A stream key é única e pode ser compartilhada para identificar seu stream nos players externos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}