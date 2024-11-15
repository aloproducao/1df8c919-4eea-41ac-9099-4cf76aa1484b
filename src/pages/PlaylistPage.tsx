import { useState, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Clock, Video, Radio, AlertCircle } from 'lucide-react';
import { Button } from '../components/Button';
import { PlaylistItem, VideoPlayer } from '../components/VideoPlayer';
import { PlaylistQueue } from '../components/PlaylistQueue';
import { VideoUploader } from '../components/VideoUploader';
import { useWhipConnection } from '../hooks/useWhipConnection';
import { formatDuration } from '../lib/utils';
import { Toggle } from '../components/Toggle';
import { StreamKey } from '../components/StreamKey';

const WHIP_BASE_URL = 'https://sirius.navve.studio/rtc/v1/whip/';
const WHIP_SECRET = 'b00510dd23154e9a8272ae1e93fc2a81';

export default function PlaylistPage() {
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [streamId, setStreamId] = useState(() => crypto.randomUUID());
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { status: whipStatus, error: whipError } = useWhipConnection({
    stream: isStreaming ? canvasRef.current?.mediaStream : null,
    streamId,
    baseUrl: WHIP_BASE_URL,
    secret: WHIP_SECRET,
  });

  const handleVideoEnd = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (isLooping) {
      setCurrentIndex(0);
    } else {
      setIsPlaying(false);
      setCurrentIndex(0);
    }
  };

  const handleSkipNext = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (isLooping) {
      setCurrentIndex(0);
    }
  };

  const handleSkipPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (isLooping) {
      setCurrentIndex(playlist.length - 1);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
  };

  const handleReorder = (startIndex: number, endIndex: number) => {
    const newPlaylist = [...playlist];
    const [removed] = newPlaylist.splice(startIndex, 1);
    newPlaylist.splice(endIndex, 0, removed);
    setPlaylist(newPlaylist);
  };

  const calculateTotalDuration = () => {
    return playlist.reduce((total, item) => total + item.duration, 0);
  };

  return (
    <div className="container mx-auto px-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Central de Transmissão</h1>
          <p className="mt-1 text-base text-slate-600 dark:text-slate-400">
            Transmissão de playlist com latência ultra baixa
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {whipStatus === 'streaming' && (
            <span className="flex items-center text-emerald-600 dark:text-emerald-500">
              <Radio className="w-4 h-4 animate-pulse mr-2" />
              Ao Vivo
            </span>
          )}
          <Button
            onClick={toggleStreaming}
            variant={isStreaming ? 'danger' : 'success'}
            disabled={playlist.length === 0}
            className="flex-1 sm:flex-none"
          >
            {isStreaming ? 'Parar Transmissão' : 'Iniciar Transmissão'}
          </Button>
          <VideoUploader onUpload={(items) => setPlaylist([...playlist, ...items])} />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg">
            <VideoPlayer
              ref={videoRef}
              playlist={playlist}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              onEnded={handleVideoEnd}
              onTimeUpdate={(time) => {
                setCurrentTime(time);
                setRemainingTime(time);
              }}
              canvasRef={canvasRef}
            />
            {playlist.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center p-4">
                  <Video className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Adicione vídeos para começar a transmissão</p>
                  <p className="mt-2 text-sm">Formatos suportados: MP4 e WebM</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={handleSkipPrevious}
                  disabled={playlist.length === 0 || (!isLooping && currentIndex === 0)}
                  title="Anterior"
                >
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button
                  onClick={togglePlayback}
                  disabled={playlist.length === 0}
                  title={isPlaying ? 'Pausar' : 'Reproduzir'}
                  className="min-w-[48px] h-12"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  onClick={handleSkipNext}
                  disabled={playlist.length === 0 || (!isLooping && currentIndex === playlist.length - 1)}
                  title="Próximo"
                >
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>
              <Toggle
                label="Repetir Lista"
                checked={isLooping}
                onChange={(e) => setIsLooping(e.target.checked)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <span className="flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-2" />
                Atual: {formatDuration(currentTime)}
              </span>
              <span className="flex items-center px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 mr-2" />
                Total: {formatDuration(calculateTotalDuration())}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm">
            <StreamKey value={streamId} onChange={setStreamId} />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Lista de Reprodução
              </h2>
            </div>
            <div className="p-4">
              <PlaylistQueue
                playlist={playlist}
                currentIndex={currentIndex}
                currentTime={currentTime}
                onReorder={handleReorder}
                onRemove={(index) => {
                  const newPlaylist = playlist.filter((_, i) => i !== index);
                  setPlaylist(newPlaylist);
                  if (index <= currentIndex) {
                    setCurrentIndex(Math.max(0, currentIndex - 1));
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}