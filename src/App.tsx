import React, { useRef, useEffect, useState } from 'react';
import { Camera, Mic, Radio, Wifi } from 'lucide-react';
import { Button } from './components/Button';
import { DeviceSelect } from './components/DeviceSelect';
import { Toggle } from './components/Toggle';
import { useMediaDevices } from './hooks/useMediaDevices';
import { useStream } from './hooks/useStream';
import { useWhipConnection } from './hooks/useWhipConnection';
import { getStreamIdFromUrl } from './lib/utils';

const WHIP_BASE_URL = 'https://sirius.navve.studio/rtc/v1/whip/';
const WHIP_SECRET = 'b00510dd23154e9a8272ae1e93fc2a81';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videoDevices, audioDevices } = useMediaDevices();
  const [isStreaming, setIsStreaming] = useState(false);
  const streamId = getStreamIdFromUrl();
  
  const [config, setConfig] = useState({
    videoDeviceId: '',
    audioDeviceId: '',
    noiseReduction: false,
    echoCancellation: false,
  });

  const { stream, error: streamError } = useStream(config);
  
  const { status: whipStatus, error: whipError } = useWhipConnection({
    stream: isStreaming ? stream : null,
    streamId,
    baseUrl: WHIP_BASE_URL,
    secret: WHIP_SECRET,
  });

  // Update video preview
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Set initial devices when available
  useEffect(() => {
    if (videoDevices.length && !config.videoDeviceId) {
      setConfig(prev => ({ ...prev, videoDeviceId: videoDevices[0].deviceId }));
    }
    if (audioDevices.length && !config.audioDeviceId) {
      setConfig(prev => ({ ...prev, audioDeviceId: audioDevices[0].deviceId }));
    }
  }, [videoDevices, audioDevices]);

  const error = streamError || whipError;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">WebRTC Stream</h1>
          <div className="flex items-center space-x-2">
            {whipStatus === 'streaming' && (
              <span className="flex items-center text-green-600">
                <Radio className="w-4 h-4 animate-pulse mr-2" />
                Live
              </span>
            )}
            <Button
              onClick={() => setIsStreaming(!isStreaming)}
              variant={isStreaming ? 'danger' : 'primary'}
              disabled={!stream || !!error}
            >
              {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-white p-4 text-center">
                  <p>{error.message}</p>
                </div>
              )}
              {(!stream && !error) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-slate-500" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center">
                <Camera className="w-4 h-4 mr-1" />
                {stream?.getVideoTracks().length ? 'Camera connected' : 'No camera'}
              </span>
              <span className="flex items-center">
                <Mic className="w-4 h-4 mr-1" />
                {stream?.getAudioTracks().length ? 'Microphone connected' : 'No microphone'}
              </span>
              <span className="flex items-center">
                <Wifi className="w-4 h-4 mr-1" />
                Stream Key: {streamId}
              </span>
            </div>
          </div>

          <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <DeviceSelect
              label="Camera"
              devices={videoDevices}
              value={config.videoDeviceId}
              onChange={(videoDeviceId) => setConfig(prev => ({ ...prev, videoDeviceId }))}
            />

            <DeviceSelect
              label="Microphone"
              devices={audioDevices}
              value={config.audioDeviceId}
              onChange={(audioDeviceId) => setConfig(prev => ({ ...prev, audioDeviceId }))}
            />

            <div className="space-y-4">
              <Toggle
                label="Noise Reduction"
                checked={config.noiseReduction}
                onChange={(e) => setConfig(prev => ({ ...prev, noiseReduction: e.target.checked }))}
              />
              <Toggle
                label="Echo Cancellation"
                checked={config.echoCancellation}
                onChange={(e) => setConfig(prev => ({ ...prev, echoCancellation: e.target.checked }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;