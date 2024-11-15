import { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';

interface VideoSeekBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export function VideoSeekBar({ currentTime, duration, onSeek, className }: VideoSeekBarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleSeek = (clientX: number) => {
    if (!progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    const time = Math.max(0, Math.min(position * duration, duration));
    
    return time;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const time = handleSeek(e.clientX);
    if (time !== undefined) {
      setDragPosition(time);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const time = handleSeek(e.clientX);
    if (time !== undefined) {
      setDragPosition(time);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const time = handleSeek(e.clientX);
    if (time !== undefined) {
      onSeek(time);
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const progress = isDragging 
    ? (dragPosition / duration) * 100 
    : (currentTime / duration) * 100;

  return (
    <div 
      ref={progressRef}
      className={cn(
        "relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer group",
        className
      )}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
      <div 
        className={cn(
          "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3",
          "bg-emerald-500 rounded-full shadow-sm opacity-0 transition-opacity",
          "group-hover:opacity-100",
          isDragging && "opacity-100"
        )}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}