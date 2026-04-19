import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';
import IntegrityBadge from '../components/IntegrityBadge';
import PageTransition from '../components/PageTransition';
import { SkeletonStats } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

interface ReportData {
  session: any;
  quizResults: any[];
  integrityEvents: any[];
  integrityScore: number;
  integrityStatus: string;
}

function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const inc = value / 40;
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display}</>;
}

export default function Report() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    // Fire confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B'],
    });

    if (!sessionId) return;
    api.get(`/api/sessions/${sessionId}/report`).then((res) => {
      setReport(res.data);
    }).catch(() => {
      toast.error('Failed to load report');
    }).finally(() => setLoading(false));
  }, [sessionId]);

  const handleRate = async () => {
    if (!sessionId || rating === 0) return;
    try {
      await api.post(`/api/sessions/${sessionId}/rate`, { rating });
      setRated(true);
      toast.success('Rating submitted! ⭐');
    } catch {
      toast.error('Failed to submit rating');
    }
  };

  const eloChange = report?.quizResults?.length
    ? Math.round(
        (report.quizResults.reduce((sum, qr) => sum + (qr.score || 0), 0) / report.quizResults.length - 50) / 5
      )
    : 0;

  const duration = report?.session?.started_at && report?.session?.ended_at
    ? Math.round((new Date(report.session.ended_at).getTime() - new Date(report.session.started_at).getTime()) / 60000)
    : 0;

  const getLabelStyle = (label: string) => {
    switch (label) {
      case 'PROGRESS': return 'pill-success';
      case 'WEAK_GAP': return 'pill-warning';
      case 'STRONG_GAP': return 'pill-danger';
      case 'RETRY': return 'pill-primary';
      default: return '';
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen" style={{ background: '#0F172A' }}>
        <Navbar />

        <div className="max-w-[900px] mx-auto px-6 py-12">
          {loading ? (
            <div className="space-y-6">
              <div className="glass-card p-12 text-center">
                <div className="skeleton w-20 h-20 rounded-full mx-auto mb-4" />
                <div className="skeleton h-6 w-48 mx-auto mb-2" />
                <div className="skeleton h-4 w-32 mx-auto" />
              </div>
              <SkeletonStats />
            </div>
          ) : (
            <>
              {/* Hero */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-12 text-center mb-8"
              >
                <img
                  src="https://source.unsplash.com/800x600/?celebration,success"
                  alt="Celebration"
                  className="w-full h-44 object-cover rounded-xl mb-6 opacity-90"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)' }}
                >
                  <span className="text-4xl">✓</span>
                </motion.div>
                <h1 className="text-3xl font-extrabold mb-2">Session Complete!</h1>
                {duration > 0 && (
                  <p className="text-sm" style={{ color: '#94A3B8' }}>
                    Duration: {duration} minutes
                  </p>
                )}
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5 text-center">
                  <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Integrity Score</p>
                  <p className="text-2xl font-bold" style={{ color: (report?.integrityScore || 0) > 70 ? '#10B981' : '#F59E0B' }}>
                    <AnimatedNumber value={report?.integrityScore || 100} />
                  </p>
                  <span className={`pill text-xs mt-1 ${report?.integrityStatus === 'clean' ? 'pill-success' : report?.integrityStatus === 'review' ? 'pill-warning' : 'pill-danger'}`}>
                    {report?.integrityStatus || 'clean'}
                  </span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5 text-center">
                  <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>ELO Change</p>
                  <p className="text-2xl font-bold" style={{ color: eloChange >= 0 ? '#10B981' : '#EF4444' }}>
                    {eloChange >= 0 ? '+' : ''}<AnimatedNumber value={Math.abs(eloChange)} />
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5 text-center">
                  <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Questions</p>
                  <p className="text-2xl font-bold" style={{ color: '#A5B4FC' }}>
                    <AnimatedNumber value={report?.quizResults?.length || 0} />
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5 text-center">
                  <p className="text-xs mb-2" style={{ color: '#94A3B8' }}>Avg Score</p>
                  <p className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>
                    <AnimatedNumber value={report?.quizResults?.length ? Math.round(report.quizResults.reduce((s, q) => s + (q.score || 0), 0) / report.quizResults.length) : 0} />
                  </p>
                </motion.div>
              </div>

              {/* Quiz Breakdown */}
              {report?.quizResults && report.quizResults.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4" style={{ color: '#F8FAFC' }}>Quiz Breakdown</h2>
                  <div className="glass-card overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                          <th className="text-left text-xs font-medium p-3" style={{ color: '#94A3B8' }}>Topic</th>
                          <th className="text-center text-xs font-medium p-3" style={{ color: '#94A3B8' }}>Score</th>
                          <th className="text-center text-xs font-medium p-3" style={{ color: '#94A3B8' }}>Time</th>
                          <th className="text-center text-xs font-medium p-3" style={{ color: '#94A3B8' }}>ML Label</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.quizResults.map((qr, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td className="p-3 text-sm font-medium" style={{ color: '#E2E8F0' }}>{qr.topic}</td>
                            <td className="p-3 text-sm text-center" style={{ color: '#E2E8F0' }}>{qr.score}</td>
                            <td className="p-3 text-sm text-center" style={{ color: '#94A3B8' }}>{qr.time_taken}s</td>
                            <td className="p-3 text-center">
                              <span className={`pill text-xs ${getLabelStyle(qr.ml_label)}`}>
                                {qr.ml_label}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Roadmap Updates */}
              {report?.quizResults?.some(qr => qr.ml_label === 'PROGRESS') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                  className="p-4 rounded-xl mb-8"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <p className="text-sm font-medium" style={{ color: '#34D399' }}>
                    🎉 New topic unlocked: {report.quizResults.find(qr => qr.ml_label === 'PROGRESS')?.topic}
                  </p>
                </motion.div>
              )}
              {report?.quizResults?.some(qr => qr.ml_label === 'STRONG_GAP') && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
                  className="p-4 rounded-xl mb-8"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p className="text-sm font-medium" style={{ color: '#F87171' }}>
                    📚 Added to your practice queue: {report.quizResults.find(qr => qr.ml_label === 'STRONG_GAP')?.topic}
                  </p>
                </motion.div>
              )}

              {/* Peer Rating */}
              <div className="glass-card p-6 mb-8 text-center">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#F8FAFC' }}>
                  Rate your session partner
                </h3>
                {!rated ? (
                  <>
                    <div className="star-rating flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <span className="text-3xl" style={{
                            color: star <= (hoverRating || rating) ? '#F59E0B' : '#475569',
                            transition: 'color 0.15s ease',
                          }}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <button onClick={handleRate} className="btn-glow" disabled={rating === 0}>
                      Submit Rating
                    </button>
                  </>
                ) : (
                  <p className="text-sm" style={{ color: '#10B981' }}>Thank you for your feedback! ⭐</p>
                )}
              </div>

              {/* CTAs */}
              <div className="flex gap-4 justify-center">
                <Link to="/dashboard" className="btn-glow">
                  ← Back to Dashboard
                </Link>
                <Link to="/match" className="btn-glow btn-secondary">
                  Find Another Match
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
