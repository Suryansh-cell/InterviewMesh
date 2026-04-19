import React, { useEffect } from 'react';
import { usePeer } from '../hooks/usePeer';

interface VideoPanelProps {
  roomId: string;
}

export default function VideoPanel({ roomId }: VideoPanelProps) {
  const {
    localVideoRef,
    remoteVideoRef,
    isAudioEnabled,
    isVideoEnabled,
    error,
    toggleAudio,
    toggleVideo,
    getLocalStream,
  } = usePeer({ roomId });

  useEffect(() => {
    getLocalStream();
  }, [getLocalStream]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0F172A' }}>
      {/* Remote Video (Main) */}
      <div className="flex-1 relative overflow-hidden rounded-lg m-1"
        style={{ background: 'rgba(30,41,59,0.6)' }}>
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="#EF4444" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>Video unavailable</p>
            <p className="text-xs mt-1" style={{ color: '#64748B' }}>{error}</p>
          </div>
        ) : (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        )}

        {/* Local Video (PiP) */}
        <div className="absolute bottom-3 right-3 w-32 h-24 rounded-lg overflow-hidden border-2 shadow-xl"
          style={{ borderColor: 'rgba(99,102,241,0.4)' }}>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 p-2">
        <button
          onClick={toggleAudio}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isAudioEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.3)',
            border: `1px solid ${isAudioEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.5)'}`,
          }}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .67-.1 1.32-.27 1.94" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        <button
          onClick={toggleVideo}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isVideoEnabled ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.3)',
            border: `1px solid ${isVideoEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.5)'}`,
          }}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth="2">
              <path d="M23 7l-7 5 7 5V7z" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
              <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
