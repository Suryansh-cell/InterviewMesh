import React from 'react';
import { motion } from 'framer-motion';

interface RoadmapNode {
  id?: number;
  topic: string;
  status: string; // 'locked' | 'active' | 'completed'
  ml_label?: string;
}

interface RoadmapViewProps {
  nodes: RoadmapNode[];
}

const defaultNodes: RoadmapNode[] = [
  { topic: 'DSA', status: 'completed' },
  { topic: 'LLD', status: 'active' },
  { topic: 'System Design', status: 'locked' },
  { topic: 'OS', status: 'locked' },
  { topic: 'DBMS', status: 'locked' },
  { topic: 'CN', status: 'locked' },
];

export default function RoadmapView({ nodes }: RoadmapViewProps) {
  const displayNodes = nodes.length > 0 ? nodes : defaultNodes;

  const getNodeStyles = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'rgba(16,185,129,0.15)',
          border: 'rgba(16,185,129,0.4)',
          icon: '✓',
          color: '#34D399',
          glow: '0 0 15px rgba(16,185,129,0.3)',
        };
      case 'active':
        return {
          bg: 'rgba(99,102,241,0.15)',
          border: 'rgba(99,102,241,0.5)',
          icon: '→',
          color: '#A5B4FC',
          glow: '0 0 20px rgba(99,102,241,0.4)',
        };
      default:
        return {
          bg: 'rgba(255,255,255,0.03)',
          border: 'rgba(255,255,255,0.08)',
          icon: '🔒',
          color: '#64748B',
          glow: 'none',
        };
    }
  };

  return (
    <div className="w-full relative px-6 py-4">
      <div className="flex items-center gap-6 overflow-x-auto pb-8 pt-4 custom-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
        {displayNodes.map((node, i) => {
          const styles = getNodeStyles(node.status);
          const isActive = node.status === 'active';
          const isCompleted = node.status === 'completed';
          const isLocked = node.status === 'locked';

          return (
            <React.Fragment key={node.topic}>
              {/* Node Wrapper */}
              <div className="flex-shrink-0 flex items-center gap-6" style={{ scrollSnapAlign: 'start' }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`group relative flex flex-col items-center gap-5 p-6 rounded-[32px] transition-all duration-500 ${
                    isActive ? 'scale-110 z-10' : 'scale-100 opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: `2px solid ${isActive ? 'rgba(99, 102, 241, 0.4)' : isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                    boxShadow: isActive ? '0 0 30px rgba(99, 102, 241, 0.2)' : 'none',
                    minWidth: '140px'
                  }}
                >
                  {/* Status Indicator Dot */}
                  <div className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border-4 border-[#1e293b] flex items-center justify-center text-[10px] font-black ${
                    isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-indigo-500 text-white animate-pulse' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : isActive ? '●' : '×'}
                  </div>

                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition-transform duration-500 group-hover:rotate-6 ${
                      isActive ? 'bg-indigo-500 text-white shadow-xl shadow-indigo-500/40' : 
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : isActive ? <span className="animate-spin-slow">⭐</span> : '🔒'}
                  </div>

                  <div className="text-center space-y-1">
                    <span className={`text-xs font-black uppercase tracking-[0.1em] block ${
                      isActive ? 'text-indigo-400' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                    }`}>
                      {node.topic}
                    </span>
                    <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest block">
                      {node.status}
                    </span>
                  </div>

                  {/* Reflection Glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-indigo-500/10 to-transparent pointer-events-none" />
                  )}
                </motion.div>

                {/* Connector Line */}
                {i < displayNodes.length - 1 && (
                  <div className="w-16 relative flex items-center justify-center">
                    <div
                      className={`h-1 rounded-full transition-all duration-1000 ${
                        displayNodes[i + 1].status !== 'locked'
                          ? 'w-full bg-gradient-to-r from-indigo-500 to-indigo-500/20 shadow-[0_0_15px_rgba(93,92,241,0.3)]'
                          : 'w-8 bg-white/5'
                      }`}
                    />
                    {isCompleted && (
                      <motion.div 
                        initial={{ left: 0 }}
                        animate={{ left: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        className="absolute w-2 h-2 rounded-full bg-indigo-400 blur-sm"
                      />
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Scroll Hint */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-full bg-gradient-to-l from-[#0F172A] to-transparent pointer-events-none opacity-60" />
    </div>
  );
}
