import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface UsePeerOptions {
  roomId: string;
  onRemoteStream?: (stream: MediaStream) => void;
}

export function usePeer({ roomId, onRemoteStream }: UsePeerOptions) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const signalSocketRef = useRef<Socket | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.warn('Could not access camera/mic:', err);
      setError('Camera/microphone access denied');
      return null;
    }
  }, []);

  const createPeerConnection = useCallback(() => {
    if (peerConnectionRef.current) return peerConnectionRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalSocketRef.current?.emit('ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      console.log('Received remote stream:', remoteStream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        console.log('Set remote video srcObject');
      }
      onRemoteStream?.(remoteStream);
      setIsConnected(true);
      setError(null);
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [onRemoteStream, roomId]);

  const toggleAudio = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled((prev) => !prev);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled((prev) => !prev);
    }
  }, []);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    peerConnectionRef.current?.close();
    localStreamRef.current = null;
    peerConnectionRef.current = null;
    signalSocketRef.current?.disconnect();
    signalSocketRef.current = null;
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const SOCKET_URL = `http://${window.location.hostname}:3001`;
    const socket = io(`${SOCKET_URL}/signal`, {
      transports: ['websocket', 'polling'],
    });
    signalSocketRef.current = socket;

    const startCallIfNeeded = async (shouldCreateOffer: boolean) => {
      const stream = localStreamRef.current || (await getLocalStream());
      if (!stream) return;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        const alreadyAdded = pc.getSenders().some((sender) => sender.track === track);
        if (!alreadyAdded) pc.addTrack(track, stream);
      });

      if (shouldCreateOffer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      }
    };

    socket.on('connect', () => socket.emit('join-room', roomId));
    socket.on('room-created', () => startCallIfNeeded(true));
    socket.on('room-joined', () => startCallIfNeeded(false));
    socket.on('peer-joined', () => startCallIfNeeded(true));

    socket.on('offer', async ({ offer }) => {
      console.log('Received offer, creating answer');
      const stream = localStreamRef.current || (await getLocalStream());
      if (!stream) return;

      const pc = createPeerConnection();
      stream.getTracks().forEach((track) => {
        const alreadyAdded = pc.getSenders().some((sender) => sender.track === track);
        if (!alreadyAdded) pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer });
      console.log('Sent answer');
    });

    socket.on('answer', async ({ answer }) => {
      console.log('Received answer');
      const pc = peerConnectionRef.current;
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('ice-candidate', async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore stale ICE candidates during reconnects.
      }
    });

    socket.on('room-full', () => setError('Room is full. Please create a new session.'));
    socket.on('peer-disconnected', () => setIsConnected(false));

    return () => {
      socket.removeAllListeners();
      cleanup();
    };
  }, [cleanup, createPeerConnection, getLocalStream, roomId]);

  return {
    localVideoRef,
    remoteVideoRef,
    isAudioEnabled,
    isVideoEnabled,
    isConnected,
    error,
    toggleAudio,
    toggleVideo,
    getLocalStream,
    cleanup,
  };
}
