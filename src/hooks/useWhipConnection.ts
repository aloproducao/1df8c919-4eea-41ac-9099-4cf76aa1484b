import { useState, useEffect } from 'react';

interface WhipConfig {
  stream: MediaStream | null;
  streamId: string;
  baseUrl: string;
  secret: string;
}

export function useWhipConnection({ stream, streamId, baseUrl, secret }: WhipConfig) {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'streaming' | 'error'>('idle');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!stream) return;

    let pc: RTCPeerConnection | null = null;

    async function connect() {
      try {
        setStatus('connecting');
        setError(null);

        pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        // Add tracks to peer connection
        stream.getTracks().forEach(track => {
          pc?.addTrack(track, stream);
        });

        // Create and set local description
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Ensure we have a local description before proceeding
        if (!pc.localDescription) throw new Error('Failed to create local description');

        // Send the WHIP request
        const endpoint = `${baseUrl}?app=live&stream=${streamId}&secret=${secret}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/sdp',
          },
          body: pc.localDescription.sdp,
        });

        if (!response.ok) {
          throw new Error(`WHIP server error: ${response.status}`);
        }

        const answer = await response.text();
        await pc.setRemoteDescription({
          type: 'answer',
          sdp: answer,
        });

        setStatus('streaming');
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to establish WHIP connection'));
        setStatus('error');
      }
    }

    connect();

    return () => {
      if (pc) {
        pc.close();
      }
      setStatus('idle');
    };
  }, [stream, streamId, baseUrl, secret]);

  return { status, error };
}