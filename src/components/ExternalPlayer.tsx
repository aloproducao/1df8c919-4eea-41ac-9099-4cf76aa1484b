import React, { useEffect, useRef, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { Select } from './Select';

interface ExternalPlayerProps {
  stream: MediaStream | null;
}

export function ExternalPlayer({ stream }: ExternalPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    async function getAudioDevices() {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const outputs = devices.filter(device => device.kind === 'audiooutput');
        setAudioDevices(outputs);
        
        // Set default device
        if (outputs.length > 0 && !selectedDevice) {
          setSelectedDevice(outputs[0].deviceId);
        }
      } catch (error) {
        console.error('Failed to enumerate audio devices:', error);
      }
    }

    getAudioDevices();
    navigator.mediaDevices.addEventListener('devicechange', getAudioDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getAudioDevices);
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && selectedDevice) {
      // @ts-ignore - setSinkId is not in the types yet
      if (videoRef.current.setSinkId) {
        // @ts-ignore
        videoRef.current.setSinkId(selectedDevice).catch(console.error);
      }
    }
  }, [selectedDevice]);

  return (
    <div 
      className="relative w-full h-full bg-black"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-contain"
      />
      
      {showControls && audioDevices.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 max-w-sm mx-auto">
            <Volume2 className="w-5 h-5 text-white" />
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="flex-1"
            >
              {audioDevices.map((device) => (
                <option 
                  key={device.deviceId} 
                  value={device.deviceId}
                >
                  {device.label || `Saída de Áudio ${audioDevices.indexOf(device) + 1}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}