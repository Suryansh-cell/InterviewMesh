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
    return livePeers
      .filter((peer) => peer.userId !== user.id)
      .map((peer) => ({
        ...peer,
        id: peer.userId,
        matchScore: computeCompatibility(peer),
      }));
  }, [livePeers, user]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/api/match');
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
      setLivePeers(users);
      setLiveCount(users.filter((peer) => peer.userId !== user.id).length);
    });

    const unsubscribeIncoming = matchSocket.on('incoming-match', ({ roomId, from }: any) => {
      toast.success(`${from.name} connected with you! Redirecting...`, {
        style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' },
      });
      navigate(`/session/${roomId}`);
    });

    const unsubscribeError = matchSocket.on('match-error', ({ message }: any) => {
      toast.error(message || 'Match request failed');
    });

    return () => {
      unsubscribeLobby();
      unsubscribeIncoming();
      unsubscribeError();
    };
  }, [matchSocket, navigate, user]);

  const handleStartSession = async (matchId: number) => {
    if (!user) return;
    setStarting(matchId);
    try {
      const res = await api.post('/api/match/accept', { matchedUserId: matchId });
      toast.success('Match found! 🎉', {
        style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)' },
      });
      matchSocket.emit('request-match', {
        targetUserId: matchId,
        roomId: res.data.roomId,
        from: { id: user.id, name: user.name },
      });
      navigate(`/session/${res.data.roomId}`);
    } catch {
      toast.error('Failed to start session');
    } finally {
      setStarting(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#0F172A' }}>
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-20 bg-white/5 p-12 rounded-[40px] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 -ml-32 -mt-32 rounded-full blur-3xl opacity-50" />
            <div className="relative z-10 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="pill pill-primary mb-6 py-2 px-6"
              >
                <span className="live-dot mr-2" />
                Searching Live Database
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-6xl font-black mb-6 tracking-tighter"
              >
                Find Your <span className="gradient-text">Ideal Match</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg max-w-lg mb-8 leading-relaxed"
                style={{ color: '#94A3B8' }}
              >
                Our proprietary algorithm analyzes skill gaps, ELO rating, and past performance to find the perfect peer for your next session.
              </motion.p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 opacity-60">
                <span className="text-xs font-black uppercase tracking-widest">Live peers: {liveCount}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-xs font-black uppercase tracking-widest">Global ELO: 1420</span>
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
            </motion.div>
          </div>

          {/* Match Cards Section */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-widest opacity-60">Top Recommendations</h2>
              <div className="h-px flex-1 bg-white/5" />
            </div>
            
            {loading ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          ) : liveMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveMatches.map((match, i) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onStartSession={handleStartSession}
                  index={i}
                />
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
          ) : (
            /* No Matches */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 text-center max-w-md mx-auto"
            >
              <img
                src="https://source.unsplash.com/600x400/?empty,search"
                alt="No matches"
                className="w-full h-40 object-cover rounded-xl mb-5 opacity-90"
              />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#E2E8F0' }}>
                No peers online right now
              </h3>
              <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                Check back later or set yourself as available
              </p>
              <button
                onClick={() => {
                  if (!user?.id) return;
                  api.patch(`/api/users/${user.id}`, { is_online: true });
                  toast('You\'re now visible to other students', { icon: '👋' });
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
  </PageTransition>
  );
}
