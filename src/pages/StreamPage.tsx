import { useRef, useEffect, useState } from 'react';
import { Camera, Mic, Radio, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { DeviceSelect } from '../components/DeviceSelect';
import { Toggle } from '../components/Toggle';
import { StreamKey } from '../components/StreamKey';
import { InfoPanel } from '../components/InfoPanel';
import { useMediaDevices } from '../hooks/useMediaDevices';
import { useStream } from '../hooks/useStream';
import { useWhipConnection } from '../hooks/useWhipConnection';
import { getStreamIdFromUrl } from '../lib/utils';

const WHIP_BASE_URL = 'https://sirius.navve.studio/rtc/v1/whip/';
const WHIP_SECRET = 'b00510dd23154e9a8272ae1e93fc2a81';

export default function StreamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { videoDevices, audioDevices } = useMediaDevices();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamId, setStreamId] = useState(getStreamIdFromUrl());
  
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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">TurboCam Studio</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Transmissão em tempo real com latência ultra baixa
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <InfoPanel />
          {whipStatus === 'streaming' && (
            <span className="flex items-center text-emerald-600 dark:text-emerald-500">
              <Radio className="w-4 h-4 animate-pulse mr-2" />
              Ao Vivo
            </span>
          )}
          <Button
            onClick={() => setIsStreaming(!isStreaming)}
            variant={isStreaming ? 'danger' : 'success'}
            disabled={!stream || !!error}
            className="min-w-[140px]"
          >
            {isStreaming ? 'Parar Transmissão' : 'Iniciar Transmissão'}
          </Button>
        </div>
      </div>

      {isStreaming && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Mantenha esta janela aberta</p>
            <p className="mt-1">Para garantir uma transmissão estável, não feche ou minimize esta janela durante a transmissão ao vivo.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg">
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

          <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center">
              <Camera className="w-4 h-4 mr-1" />
              {stream?.getVideoTracks().length ? 'Câmera conectada' : 'Sem câmera'}
            </span>
            <span className="flex items-center">
              <Mic className="w-4 h-4 mr-1" />
              {stream?.getAudioTracks().length ? 'Microfone conectado' : 'Sem microfone'}
            </span>
          </div>
        </div>

        <div className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm">
          <StreamKey value={streamId} onChange={setStreamId} />

          <DeviceSelect
            label="Câmera"
            devices={videoDevices}
            value={config.videoDeviceId}
            onChange={(videoDeviceId) => setConfig(prev => ({ ...prev, videoDeviceId }))}
          />

          <DeviceSelect
            label="Microfone"
            devices={audioDevices}
            value={config.audioDeviceId}
            onChange={(audioDeviceId) => setConfig(prev => ({ ...prev, audioDeviceId }))}
          />

          <div className="space-y-4">
            <Toggle
              label="Redução de Ruído"
              checked={config.noiseReduction}
              onChange={(e) => setConfig(prev => ({ ...prev, noiseReduction: e.target.checked }))}
            />
            <Toggle
              label="Cancelamento de Eco"
              checked={config.echoCancellation}
              onChange={(e) => setConfig(prev => ({ ...prev, echoCancellation: e.target.checked }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}