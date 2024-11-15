import { useState } from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

interface StreamKeyProps {
  value: string;
  onChange: (value: string) => void;
}

export function StreamKey({ value, onChange }: StreamKeyProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openExternalPlayer = (type: 'webrtc' | 'flv') => {
    const baseUrl = 'https://aloserver.vercel.app';
    const url = type === 'webrtc' 
      ? `${baseUrl}/playerwhep.html?stream=${value}`
      : `${baseUrl}/playerflv.html?stream=${value}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Stream Key
        </label>
        <div className="flex space-x-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Digite a chave do stream"
            className="font-mono text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-600"
          />
          <Button
            onClick={copyToClipboard}
            variant="secondary"
            className="px-3"
            title="Copiar"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {copied && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Copiado para a área de transferência!
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
          Players Externos
        </label>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => openExternalPlayer('webrtc')}
            variant="secondary"
            className="text-sm justify-start"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Player WebRTC
          </Button>
          <Button
            onClick={() => openExternalPlayer('flv')}
            variant="secondary"
            className="text-sm justify-start"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Player HTTP-FLV
          </Button>
        </div>
      </div>
    </div>
  );
}