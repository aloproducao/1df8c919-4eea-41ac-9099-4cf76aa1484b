import { useState, useEffect, useRef } from 'react';

interface StreamConfig {
  videoDeviceId: string;
  audioDeviceId: string;
  noiseReduction: boolean;
  echoCancellation: boolean;
}

export function useStream(config: StreamConfig) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const previousStream = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function setupStream() {
      try {
        // Stop previous stream tracks
        if (previousStream.current) {
          previousStream.current.getTracks().forEach(track => track.stop());
        }

        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: config.videoDeviceId,
          },
          audio: {
            deviceId: config.audioDeviceId,
            noiseSuppression: config.noiseReduction,
            echoCancellation: config.echoCancellation,
          },
        });

        setStream(newStream);
        previousStream.current = newStream;
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to access media devices'));
        setStream(null);
      }
    }

    setupStream();

    return () => {
      if (previousStream.current) {
        previousStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [config]);

  return { stream, error };
}