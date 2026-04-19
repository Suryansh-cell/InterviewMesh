import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `http://${window.location.hostname}:3001`;

export function useSocket(namespace: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(`${SOCKET_URL}/${namespace}`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [namespace]);

  const emit = useCallback((event: string, data?: any) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, callback: (...args: any[]) => void) => {
    socketRef.current?.on(event, callback);
    return () => {
      socketRef.current?.off(event, callback);
    };
  }, []);

  const emitWithAck = useCallback((event: string, data?: any): Promise<any> => {
    return new Promise((resolve) => {
      socketRef.current?.emit(event, data, (response: any) => {
        resolve(response);
      });
    });
  }, []);

  return { socket: socketRef.current, emit, on, emitWithAck };
}
