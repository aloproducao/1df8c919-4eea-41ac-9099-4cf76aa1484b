import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { VideoSeekBar } from './VideoSeekBar';

export interface PlaylistItem {
  url: string;
  duration: number;
  title: string;
  format: 'mp4' | 'webm';
  width: number;
  height: number;
  originalFormat?: {
    width: number;
    height: number;
    duration: number;
  };
}

interface VideoPlayerProps {
  playlist: PlaylistItem[];
  currentIndex: number;
  isPlaying: boolean;
  onEnded: () => void;
  onTimeUpdate: (remainingTime: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ playlist, currentIndex, isPlaying, onEnded, onTimeUpdate, canvasRef }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationRef = useRef<number>();
    const audioContextRef = useRef<AudioContext>();
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const [isTabVisible, setIsTabVisible] = useState(!document.hidden);
    const lastFrameTimeRef = useRef<number>(0);
    const renderIntervalRef = useRef<NodeJS.Timeout>();
    const [currentTime, setCurrentTime] = useState(0);

    useImperativeHandle(ref, () => videoRef.current as HTMLVideoElement);

    useEffect(() => {
      const handleVisibilityChange = () => {
        setIsTabVisible(!document.hidden);
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) return;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) return;

      canvas.width = 1280;
      canvas.height = 720;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        audioDestinationRef.current = audioContextRef.current.createMediaStreamDestination();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioDestinationRef.current);
      }

      if (!mediaStreamRef.current) {
        const videoStream = canvas.captureStream(30);
        const videoTrack = videoStream.getVideoTracks()[0];
        
        if (videoTrack) {
          const encoderConfig: MediaTrackConstraints = {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
            advanced: [
              {
                // @ts-ignore - Custom codec parameters
                encodingMode: 'realtime',
                bitrateMode: 'variable',
                networkPriority: 'high',
                degradationPreference: 'maintain-framerate',
                codec: {
                  profile: 'baseline',
                  level: '3.1',
                  parameters: {
                    'profile-level-id': '42e01f',
                    'packetization-mode': '1',
                    'level-asymmetry-allowed': '1',
                    'x-google-start-bitrate': '1000',
                    'x-google-min-bitrate': '500',
                    'x-google-max-bitrate': '2500',
                    'x-google-max-quantization': '35',
                    'x-google-cpu-used': '8',
                    'x-google-max-playback-rate': '1',
                    'x-google-min-playback-rate': '1',
                    'x-google-enable-temporal-layering': '0',
                    'x-google-complexity': 'low',
                  }
                }
              }
            ]
          };

          videoTrack.applyConstraints(encoderConfig).catch(console.error);
        }

        const audioStream = audioDestinationRef.current!.stream;
        const audioTrack = audioStream.getAudioTracks()[0];
        
        if (audioTrack) {
          audioTrack.applyConstraints({
            channelCount: { ideal: 2 },
            sampleRate: { ideal: 48000 },
            sampleSize: { ideal: 16 },
            latency: { ideal: 0.01 },
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          }).catch(console.error);
        }
        
        mediaStreamRef.current = new MediaStream([videoTrack, audioTrack]);

        if (canvasRef.current) {
          // @ts-ignore - Custom property to store the stream
          canvasRef.current.mediaStream = mediaStreamRef.current;
        }
      }

      const connectAudio = async () => {
        if (audioContextRef.current && video) {
          try {
            const source = audioContextRef.current.createMediaElementSource(video);
            source.connect(gainNodeRef.current!);
          } catch (error) {
            console.warn('Audio already connected');
          }
        }
      };
      connectAudio();

      const drawFrame = () => {
        if (video.readyState >= 2) {
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let offsetX = 0;
          let offsetY = 0;
          
          if (videoAspect > canvasAspect) {
            drawHeight = canvas.width / videoAspect;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawWidth = canvas.height * videoAspect;
            offsetX = (canvas.width - drawWidth) / 2;
          }
          
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
        }
      };

      const startRendering = () => {
        if (renderIntervalRef.current) {
          clearInterval(renderIntervalRef.current);
        }

        if (isTabVisible) {
          const animate = () => {
            const now = performance.now();
            if (now - lastFrameTimeRef.current >= 33.33) {
              drawFrame();
              lastFrameTimeRef.current = now;
            }
            animationRef.current = requestAnimationFrame(animate);
          };
          animationRef.current = requestAnimationFrame(animate);
        } else {
          renderIntervalRef.current = setInterval(drawFrame, 33.33);
        }
      };

      const stopRendering = () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (renderIntervalRef.current) {
          clearInterval(renderIntervalRef.current);
        }
      };

      if (isPlaying) {
        video.play().catch(console.error);
        startRendering();
      } else {
        video.pause();
        stopRendering();
      }

      return () => {
        stopRendering();
      };
    }, [isPlaying, canvasRef, isTabVisible]);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !playlist[currentIndex]) return;

      video.src = playlist[currentIndex].url;
      if (isPlaying) {
        video.play().catch(console.error);
      }
    }, [currentIndex, playlist, isPlaying]);

    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;
      const remaining = video.duration - video.currentTime;
      setCurrentTime(video.currentTime);
      onTimeUpdate(remaining);
    };

    const handleSeek = (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = time;
    };

    return (
      <div className="relative flex flex-col">
        <div className="flex-1">
          <video
            ref={videoRef}
            className="hidden"
            onEnded={onEnded}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            crossOrigin="anonymous"
          />
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            width={1280}
            height={720}
          />
        </div>
        {playlist[currentIndex] && (
          <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <VideoSeekBar
              currentTime={currentTime}
              duration={playlist[currentIndex].duration}
              onSeek={handleSeek}
              className="w-full"
            />
          </div>
        )}
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export { VideoPlayer };