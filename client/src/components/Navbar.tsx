import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSocket } from '../hooks/useSocket';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const matchSocket = useSocket('match');
  const [incomingMatch, setIncomingMatch] = useState<any>(null);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/setup', label: 'My Skills' },
    { path: '/match', label: 'Mock Interview' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarUrl = user?.name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=6366f1`
    : '';

  const isActive = (path: string) => {
    if (path.startsWith('/dashboard#')) {
      return location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

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

    const unsubscribeIncoming = matchSocket.on('incoming-match', ({ roomId, from }: any) => {
      setIncomingMatch({ roomId, from });
      toast((t) => (
        <div className="flex items-center gap-4">
          <span className="font-medium text-sm text-white">{from.name} wants to practice!</span>
          <button
            onClick={() => {
              handleAcceptMatch(roomId);
              toast.dismiss(t.id);
            }}
            className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Join
          </button>
        </div>
      ), { duration: 10000, position: 'top-right' });
    });

    return () => {
      unsubscribeIncoming();
    };
  }, [matchSocket, user]);

  const handleAcceptMatch = (roomId: string) => {
    setIncomingMatch(null);
    navigate(`/session/${roomId}`);
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 glass-morphism-strong animate-gentle-float"
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs transition-transform group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 15px rgba(99,102,241,0.3)' }}>
            IM
          </div>
          <span className="gradient-text font-black text-xl tracking-tighter hide-mobile">
            InterviewMesh
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="relative px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:bg-white/5 active:scale-95"
              style={{
                color: isActive(link.path) ? '#A5B4FC' : '#94A3B8',
              }}
            >
              <span className="relative z-10">{link.label}</span>
              {isActive(link.path) && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* ELO & Profile Group */}
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            <div className="flex flex-col items-end hide-mobile">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Global Rank</span>
              <div className="flex items-center gap-1.5 text-sm font-black text-indigo-400">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {user?.elo_score || 1000}
              </div>
            </div>

            <div className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-lg ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all"
                />
              )}
              <div className="flex flex-col hide-mobile">
                <span className="text-xs font-bold leading-tight" style={{ color: '#E2E8F0' }}>
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Pro Tier</span>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl transition-all hover:bg-rose-500/10 hover:text-rose-400 group active:scale-90"
            style={{ color: '#94A3B8' }}
            title="Logout"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transition-transform group-hover:rotate-12">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
