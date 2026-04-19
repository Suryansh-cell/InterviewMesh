import React from 'react';
import { motion } from 'framer-motion';

interface IntegrityBadgeProps {
  score: number;
  status: string; // 'clean' | 'review' | 'suspicious'
  compact?: boolean;
}

export default function IntegrityBadge({ score, status, compact = false }: IntegrityBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'clean':
        return { color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', label: 'Clean', icon: '🛡️' };
      case 'review':
        return { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: 'Review', icon: '⚠️' };
      case 'suspicious':
        return { color: '#EF4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: 'Suspicious', icon: '🚨' };
      default:
        return { color: '#94A3B8', bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', label: 'N/A', icon: '—' };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <motion.div
        key={score}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
        }}
      >
        <span>{config.icon}</span>
        <span>{score}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={score}
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
      }}
    >
      <span className="text-lg">{config.icon}</span>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: config.color }}>
            Integrity: {score}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded-full font-medium"
            style={{ background: config.bg, color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <div className="progress-bar mt-1.5" style={{ width: '120px' }}>
          <motion.div
            className="progress-bar-fill"
            style={{ background: config.color }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </motion.div>
  );
}
