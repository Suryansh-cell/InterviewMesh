import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axios';
import CodeEditor from '../components/CodeEditor';
import VideoPanel from '../components/VideoPanel';
import QuizPanel from '../components/QuizPanel';
import IntegrityBadge from '../components/IntegrityBadge';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

export default function Session() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    integrityScore, integrityStatus, sessionTimer,
    setIntegrityScore, setSessionTimer, setRoom,
    chatMessages, addChatMessage
  } = useSessionStore();

  const [peerName, setPeerName] = useState<string>('Waiting for peer...');
  const [chatInput, setChatInput] = useState('');
  const [ending, setEnding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const editorSocket = useSocket('editor');
  const integritySocket = useSocket('integrity');

  // Session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimer(useSessionStore.getState().sessionTimer + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [setSessionTimer]);

  // Join rooms
  useEffect(() => {
    if (!roomId) return;
    setRoom(roomId);
    editorSocket.emit('join-room', roomId);
    integritySocket.emit('join-room', roomId);
  }, [roomId]);

  // Fetch session info
  useEffect(() => {
    if (!roomId) return;
    api.get(`/api/sessions/${roomId}`).then((res) => {
      const session = res.data;
      const partnerName = session.user_a === user?.id ? session.user_b_name : session.user_a_name;
      setPeerName(partnerName || 'Peer');
      // Start session
      api.patch(`/api/sessions/${roomId}/start`).catch(() => {});
    }).catch(() => {});
  }, [roomId, user]);

  // Listen for editor sync
  useEffect(() => {
    const unsub = editorSocket.on('code-update', ({ code }: any) => {
      useSessionStore.getState().setCode(code);
    });
    return unsub;
  }, [editorSocket]);

  // Listen for integrity updates
  useEffect(() => {
    const unsub = integritySocket.on('integrity-update', (data: any) => {
      if (data.severity === 'warning') {
        toast.error(`⚠️ ${data.message}`, {
          style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(239,68,68,0.3)' },
        });
        const current = useSessionStore.getState().integrityScore;
        const deduction = data.type === 'paste' ? 15 : 10;
        const nextScore = Math.max(0, current - deduction);
        const nextStatus = nextScore <= 40 ? 'suspicious' : nextScore <= 70 ? 'review' : 'clean';
        setIntegrityScore(nextScore, nextStatus);
      }
    });
    return unsub;
  }, [integritySocket, setIntegrityScore]);

  // Listen for chat
  useEffect(() => {
    const unsub = editorSocket.on('chat-message', (data: any) => {
      addChatMessage(data);
      toast(`${data.sender}: ${data.message}`, { icon: '💬' });
    });
    return unsub;
  }, [editorSocket]);

  // Integrity: detect paste
  const handleCodeChange = useCallback((code: string) => {
    editorSocket.emit('code-change', { roomId, code });
  }, [editorSocket, roomId]);

  // Paste detection
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pasteLength = e.clipboardData?.getData('text')?.length || 0;
      if (pasteLength > 10) {
        integritySocket.emit('paste-event', {
          roomId,
          userId: user?.id,
          sessionId: roomId,
          pasteLength,
          content: e.clipboardData?.getData('text'),
        });
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [roomId, user, integritySocket]);

  // Tab switch detection
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        integritySocket.emit('tab-switch', {
          roomId,
          userId: user?.id,
          sessionId: roomId,
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [roomId, user, integritySocket]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { message: chatInput.trim(), sender: user?.name || 'You', timestamp: Date.now() };
    editorSocket.emit('chat-message', { roomId, ...msg });
    addChatMessage(msg);
    setChatInput('');
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await api.patch(`/api/sessions/${roomId}/end`);
      toast.success('Session completed!');
      navigate(`/report/${roomId}`);
    } catch {
      toast.error('Failed to end session');
      setEnding(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <PageTransition className="h-screen overflow-hidden" >
      <div className="h-screen flex flex-col" style={{ background: '#0F172A' }}>
        {/* Top Bar */}
        <div
          className="flex items-center justify-between px-4 border-b"
          style={{ height: '48px', background: 'rgba(15,23,42,0.95)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <span className="pill text-xs font-mono" style={{ fontSize: '0.7rem' }}>
              {roomId?.slice(0, 8)}...
            </span>
            <span className="text-sm font-mono font-semibold" style={{ color: '#A5B4FC' }}>
              ⏱ {formatTime(sessionTimer)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>
              {peerName}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <IntegrityBadge score={integrityScore} status={integrityStatus} compact />
            <button
              onClick={handleEndSession}
              disabled={ending}
              className="btn-glow btn-danger text-xs py-1.5 px-3"
            >
              {ending ? 'Ending...' : 'End Session'}
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code Editor (60%) */}
          <div className="w-[60%] border-r" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <CodeEditor onCodeChange={handleCodeChange} />
          </div>

          {/* Right Panel (40%) */}
          <div className="w-[40%] flex flex-col">
            {/* Video (45%) */}
            <div style={{ height: '45%' }} className="border-b" >
              <VideoPanel roomId={roomId || ''} />
            </div>

            {/* Chat (10%) */}
            <div
              className="border-b flex flex-col"
              style={{ height: '10%', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex-1 overflow-y-auto px-3 py-1 flex flex-col justify-end">
                {chatMessages.slice(-3).map((msg, i) => (
                  <div key={i} className="text-xs" style={{ color: '#94A3B8' }}>
                    <span className="font-medium" style={{ color: '#A5B4FC' }}>{msg.sender}: </span>
                    {msg.message}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChat} className="flex gap-1.5 px-2 pb-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="input-dark flex-1 text-xs py-1.5 px-2.5"
                  style={{ borderRadius: '8px', fontSize: '0.75rem' }}
                />
                <button type="submit" className="text-xs px-2 rounded-lg" style={{ background: 'rgba(99,102,241,0.2)', color: '#A5B4FC' }}>
                  →
                </button>
              </form>
            </div>

            {/* Quiz (45%) */}
            <div style={{ height: '45%' }}>
              <QuizPanel sessionId={roomId || ''} />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
