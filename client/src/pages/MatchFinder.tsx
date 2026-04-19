import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import MatchCard from '../components/MatchCard';
import PageTransition from '../components/PageTransition';
import { SkeletonCard } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';

export default function MatchFinder() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const matchSocket = useSocket('match');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<number | null>(null);
  const [livePeers, setLivePeers] = useState<any[]>([]);
  const [liveCount, setLiveCount] = useState(0);

  const computeCompatibility = (peer: any) => {
    if (!user) return 0;
    const mySkills = Array.isArray(user.skill_tags) ? user.skill_tags : (user.skill_tags ? user.skill_tags : []);
    const theirSkills = Array.isArray(peer.skill_tags) ? peer.skill_tags : (peer.skill_tags ? peer.skill_tags : []);
    const overlapCount = theirSkills.filter((skill: string) => mySkills.includes(skill)).length;
    const diffCount = theirSkills.filter((skill: string) => !mySkills.includes(skill)).length;
    const base = 40 + overlapCount * 10 - diffCount * 4;
    return Math.min(98, Math.max(45, Math.round(base + (peer.rating || 0) * 2)));
  };

  const liveMatches = useMemo(() => {
    if (!user) return [];
    const matches = livePeers
      .filter((peer) => peer.userId !== user.id)
      .map((peer) => ({
        ...peer,
        id: peer.userId,
        matchScore: computeCompatibility(peer),
      }));
    console.log('Live peers:', livePeers);
    console.log('Live matches:', matches);
    return matches;
  }, [livePeers, user]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        console.log('Fetching matches...');
        const res = await api.get('/api/match');
        console.log('Matches response:', res.data);
        console.log('Number of matches:', res.data.length);
        setMatches(res.data);
      } catch (err) {
        console.error('Match fetch error:', err);
        toast.error('Failed to find matches');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  useEffect(() => {
    if (!user) return;

    console.log('Joining match lobby with user:', user);
    matchSocket.emit('join-lobby', {
      userId: user.id,
      name: user.name,
      email: user.email,
      elo_score: user.elo_score,
      rating: user.rating,
      skill_tags: user.skill_tags,
      free_slots: user.free_slots,
    });

    const unsubscribeLobby = matchSocket.on('lobby-update', (users: any[]) => {
      console.log('Received lobby update:', users);
      setLivePeers(users);
      setLiveCount(users.filter((peer) => peer.userId !== user.id).length);
    });

    const unsubscribeIncoming = matchSocket.on('incoming-match', ({ roomId, from }: any) => {
      console.log('Received incoming match:', { roomId, from });
      toast.success(`${from.name} connected with you! Redirecting...`, {
        style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' },
      });
      navigate(`/session/${roomId}`);
    });

    const unsubscribeError = matchSocket.on('match-error', ({ message }: any) => {
      console.log('Received match error:', message);
      toast.error(message || 'Match request failed');
    });

    return () => {
      unsubscribeLobby();
      unsubscribeIncoming();
      unsubscribeError();
    };
  }, [matchSocket, navigate, user]);

  const localPreviewRef = React.useRef<HTMLVideoElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  const startLocalPreview = async () => {
    setShowPreview(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (localPreviewRef.current) {
        localPreviewRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera preview failed:', err);
    }
  };

  const handleStartSession = async (matchId: number) => {
    if (!user) {
      toast.error('Please log in first');
      return;
    }
    
    console.log('Starting session with matchId:', matchId);
    setStarting(matchId);
    startLocalPreview(); // Start camera preview immediately

    // Safety watchdog: reset "starting" state after 10 seconds if nothing happens
    const watchdog = setTimeout(() => {
      if (starting === matchId) {
        setStarting(null);
        toast.error('Connection request timed out. Please try again.');
      }
    }, 10000);

    const roomId = `demo-session-${matchId}-${Date.now()}`;
    console.log('🚀 [INSTANT] Navigating to room:', roomId);
    
    // 1. Navigate Immediately
    clearTimeout(watchdog);
    navigate(`/session/${roomId}`);

    // 2. Fire-and-forget invitation logic
    try {
      const res = await api.post('/api/match/accept', { matchedUserId: matchId });
      matchSocket.emit('request-match', {
        targetUserId: matchId,
        roomId: res.data.roomId,
        from: { id: user.id, name: user.name },
      });
    } catch {
      console.log('Handshake skipped (Solo mode active)');
    } finally {
      setStarting(null);
    }
  };

  useEffect(() => {
    console.log('%c🚀 MATCHFINDER V2: Lobby Active', 'color: #6366f1; font-weight: bold; font-size: 14px;');
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#0F172A' }}>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-12 rounded-[40px] border border-indigo-500/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            <div className="relative z-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="pill pill-primary py-2 px-6 flex items-center gap-2"
                >
                  <span className="live-dot" />
                  <span className="uppercase tracking-widest text-[10px] font-black">Lobby Active</span>
                </motion.div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
                  {matchSocket.socket?.connected ? '✅ Connected' : '🔄 Connecting...'}
                </div>
              </div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
              >
                Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Intelligence</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg max-w-lg mb-8 leading-relaxed opacity-60"
              >
                Scan the global mesh for real-time peers. Our AI evaluates 20+ compatibility vectors to ensure a high-yield interview session.
              </motion.p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-white/5 rounded-full border border-white/5">Peers: {liveCount} Online</span>
                <span className="text-[10px] font-black uppercase tracking-widest py-1 px-3 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">ELO Floor: 1200</span>
              </div>
            </div>

            {/* Radar Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
              
              {showPreview ? (
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative z-30 w-48 h-48 rounded-full overflow-hidden border-4 border-indigo-500 shadow-[0_0_50px_rgba(99,102,241,0.4)]"
                >
                  <video 
                    ref={localPreviewRef}
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <div className="absolute inset-x-0 bottom-4 text-center">
                    <span className="px-2 py-1 bg-indigo-500 text-[8px] font-black uppercase tracking-widest rounded shadow-lg">
                      Connecting...
                    </span>
                  </div>
                </motion.div>
              ) : (
                <div className="radar-container scale-150 transform transition-transform duration-1000">
                  <div className="radar-circle border-indigo-500/10" style={{ width: '100%', height: '100%' }} />
                  <div className="radar-circle border-indigo-500/15" style={{ width: '75%', height: '75%' }} />
                  <div className="radar-circle border-indigo-500/20" style={{ width: '50%', height: '50%' }} />
                  <div className="radar-circle border-indigo-500/25" style={{ width: '25%', height: '25%' }} />
                  <div className="radar-sweep" />
                  {!loading && matches.length > 0 && (
                    <>
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="radar-ping" style={{ top: '20%', left: '70%' }} 
                      />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="radar-ping" style={{ top: '60%', left: '25%', animationDelay: '0.5s' }} 
                      />
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>

          {/* Match Cards Section */}
          <div className="space-y-16">
            {/* Live Section */}
            {liveMatches.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                    <span className="live-dot" />
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-400">Live Students Online</h2>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {liveMatches.map((match, i) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onStartSession={handleStartSession}
                      isLive={true}
                      index={i}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations Section */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black uppercase tracking-widest opacity-60">Top Recommendations</h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : matches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {matches.map((match, i) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onStartSession={handleStartSession}
                      index={i}
                    />
                  ))}
                </div>
              ) : !liveMatches.length && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center max-w-md mx-auto"
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                    No peers available
                  </h3>
                  <button
                    onClick={() => {
                      if (!user?.id) return;
                      api.patch(`/api/users/${user.id}`, { is_online: true });
                      toast.success('You are now online!');
                    }}
                    className="btn-glow btn-secondary"
                  >
                    Set Available
                  </button>
                </motion.div>
              )}
            </div>
          </div>
      </div>
    </div>
  </PageTransition>
  );
}
