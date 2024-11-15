import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStreamIdFromUrl(): string {
  const params = new URLSearchParams(window.location.search);
  const streamId = params.get('stream');
  
  if (!streamId) {
    // Generate a stable random ID if none provided
    const storedId = sessionStorage.getItem('whip-stream-id');
    if (storedId) return storedId;
    
    const newId = crypto.randomUUID();
    sessionStorage.setItem('whip-stream-id', newId);
    return newId;
  }
  
  return streamId;
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'));
  }
  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
}