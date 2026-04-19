import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MatchCardProps {
  match: {
    id: number;
    name: string;
    email: string;
    elo_score: number;
    rating: number;
    skill_tags: string[];
    matchScore: number;
    availableSoon?: boolean;
  };
  onStartSession: (matchId: number) => void;
  index: number;
  isLive?: boolean;
}

export default function MatchCard({ match, onStartSession, index, isLive }: MatchCardProps) {
  const [isStarting, setIsStarting] = useState(false);
  const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(match.name)}&backgroundColor=6366f1,8b5cf6,a78bfa&backgroundType=gradientLinear`;

  const handleStart = async () => {
    console.log('MatchCard handleStart called for match:', match.id, match.name);
    console.log('Match object:', match);
    console.log('onStartSession function:', onStartSession);
    setIsStarting(true);
    await onStartSession(match.id);
    setIsStarting(false);
  };

  const rank =
    match.elo_score >= 1600 ? 'Expert' :
    match.elo_score >= 1400 ? 'Advanced' :
    match.elo_score >= 1200 ? 'Intermediate' : 'Rising';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`glass-card card-hover h-full flex flex-col group cursor-pointer relative overflow-hidden ${
        isLive ? 'ring-2 ring-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' : ''
      }`}
    >
      {isLive && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse">
           <span className="w-2 h-2 rounded-full bg-white" />
           <span className="text-[10px] font-black text-white uppercase tracking-widest">LIVE</span>
        </div>
      )}
      
      <div className="p-8 flex-1 flex flex-col space-y-8">
        {/* User Profile Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={match.name}
                className="w-16 h-16 rounded-[22px] shadow-2xl border-2 border-white/10 group-hover:scale-105 transition-transform duration-500"
              />
              {(isLive || !match.availableSoon) && (
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#1e293b] ${isLive ? 'bg-indigo-500 animate-ping' : 'bg-emerald-500'}`} />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tighter group-hover:text-indigo-300 transition-colors">
                {match.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${isLive ? 'text-indigo-400' : 'text-indigo-400'}`}>{rank}</span>
                <span className="w-1 h-1 rounded-full bg-white/20" />
                <span className="pill text-[8px] px-2 py-0.5 border-none bg-indigo-500/10 text-indigo-400">PRO</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end mr-12">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Compatibility</span>
             <div className="text-xl font-black text-indigo-400">
               {match.matchScore || 0}%
             </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest opacity-30">ELO Rating</span>
            <div className="flex items-center gap-2 text-lg font-black text-white">
              <span className="text-indigo-400">#</span>{match.elo_score || 1200}
            </div>
          </div>
          <div className="space-y-1">
             <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Interview Yield</span>
             <div className="flex items-center gap-2 text-lg font-black text-emerald-400">
               94%
             </div>
          </div>
        </div>

        {/* Skills Tags */}
        <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Core Proficiencies</span>
          <div className="flex flex-wrap gap-2">
            {(match.skill_tags || ['React', 'Node.js', 'System Design']).slice(0, 3).map((skill: string) => (
              <span key={skill} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Action Area */}
        <div className="pt-4 mt-auto">
          <button
            onClick={handleStart}
            disabled={isStarting || match.availableSoon}
            className={`w-full btn-glow group/btn overflow-hidden relative ${
              match.availableSoon ? 'opacity-50 grayscale cursor-not-allowed' : 
              isLive ? 'shadow-[0_0_30px_rgba(99,102,241,0.4)]' : ''
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isStarting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Synchronizing...
                </>
              ) : (
                <>
                  {isLive ? 'Join Live Now' : 'Connect Now'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover/btn:translate-x-1">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
