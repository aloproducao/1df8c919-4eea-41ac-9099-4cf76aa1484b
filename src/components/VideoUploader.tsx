import { useState } from 'react';
import { Upload } from 'lucide-react';
import { Button } from './Button';
import { PlaylistItem } from './VideoPlayer';

interface VideoUploaderProps {
  onUpload: (items: PlaylistItem[]) => void;
}

export function VideoUploader({ onUpload }: VideoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  const processVideo = async (file: File): Promise<PlaylistItem> => {
    const url = URL.createObjectURL(file);
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = url;
      
      video.onloadedmetadata = () => {
        resolve({
          url,
          title: file.name,
          duration: Math.ceil(video.duration),
          format: file.type.includes('webm') ? 'webm' : 'mp4',
          width: video.videoWidth,
          height: video.videoHeight,
          originalFormat: {
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration,
          }
        });
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error(`Falha ao carregar o vídeo: ${file.name}`));
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const errors: string[] = [];
    const items: PlaylistItem[] = [];

    try {
      await Promise.all(files.map(async (file) => {
        try {
          const item = await processVideo(file);
          items.push(item);
        } catch (error) {
          errors.push(`${file.name}: ${(error as Error).message}`);
        }
      }));

      if (items.length > 0) {
        onUpload(items);
      }

      if (errors.length > 0) {
        alert(`Alguns vídeos falharam ao carregar:\n${errors.join('\n')}`);
      }
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        id="video-upload"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="video/mp4,video/webm"
        multiple
        onChange={handleFileChange}
      />
      <Button
        type="button"
        disabled={isUploading}
        className="min-w-[140px]"
      >
        <Upload className="w-4 h-4 mr-2" />
        {isUploading ? 'Carregando...' : 'Adicionar Vídeos'}
      </Button>
    </div>
  );
}