import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

const FEATURES = [
  { icon: '🎯', label: 'Smart Matching' },
  { icon: '💻', label: 'Live Editor' },
  { icon: '🤖', label: 'AI Roadmap' },
  { icon: '🛡️', label: 'Integrity AI' },
];

const STATS = [
  { value: '500+', label: 'Sessions' },
  { value: '200+', label: 'Students' },
  { value: 'IIIT', label: 'Lucknow' },
];

export default function Login() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [parsing, setParsing] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setResumeAnalysis(null);
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleParseResume = async () => {
    if (!resumeFile) {
      setUploadError('Please choose a resume PDF or image first.');
      return;
    }

    setParsing(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      let bodyText: string | null = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        bodyText = await response.text();
      }

      if (!response.ok) {
        const errorMessage = data?.error || bodyText || `Server returned ${response.status}`;
        throw new Error(errorMessage);
      }

      if (!data) {
        throw new Error(`Unexpected non-JSON response: ${bodyText?.substring(0, 250) || 'empty'}`);
      }

      setResumeAnalysis(data);
      toast.success('Resume parsed successfully. Topic analysis generated.');
    } catch (error: any) {
      console.error('Resume parse request failed:', error);
      setUploadError(error?.message || 'Resume parse failed.');
    } finally {
      setParsing(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/auth/status');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Google OAuth is not configured');
      }
      window.location.href = '/auth/google';
    } catch (error: any) {
      toast.error(error?.message || 'Google OAuth setup is missing on server');
    }
  };

  const handleDemoLogin = () => {
    // Demo login bypasses OAuth and creates a test user
    window.location.href = '/auth/demo';
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex">
        {/* Left Half — Hero Image */}
        <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden morph-bg">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://source.unsplash.com/1920x1080/?coding,dark,technology')`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,41,59,0.75) 50%, rgba(15,23,42,0.9) 100%)',
              backdropFilter: 'blur(1px)'
            }}
          />

          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Code Symbols */}
            {[
              { symbol: '{ }', delay: 0, duration: 8 },
              { symbol: '</>', delay: 2, duration: 10 },
              { symbol: '=>', delay: 4, duration: 7 },
              { symbol: 'fn()', delay: 1, duration: 9 },
              { symbol: '[]', delay: 3, duration: 6 },
              { symbol: '&&', delay: 5, duration: 11 }
            ].map((item, i) => (
              <motion.div
                key={i}
                className="absolute text-white/10 font-mono text-4xl font-bold select-none"
                style={{
                  left: `${10 + (i * 15) % 80}%`,
                  top: `${20 + (i * 20) % 60}%`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: item.duration,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: "easeInOut"
                }}
              >
                {item.symbol}
              </motion.div>
            ))}

            {/* Geometric Shapes */}
            {[
              { shape: 'circle', size: 200, color: 'rgba(99,102,241,0.1)', delay: 0 },
              { shape: 'square', size: 150, color: 'rgba(139,92,246,0.08)', delay: 3 },
              { shape: 'triangle', size: 180, color: 'rgba(16,185,129,0.06)', delay: 6 }
            ].map((item, i) => (
              <motion.div
                key={`shape-${i}`}
                className={`absolute ${item.shape === 'circle' ? 'rounded-full' : item.shape === 'square' ? 'rounded-lg' : ''}`}
                style={{
                  width: item.size,
                  height: item.size,
                  backgroundColor: item.color,
                  left: `${20 + (i * 30) % 60}%`,
                  top: `${30 + (i * 25) % 50}%`,
                  clipPath: item.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 12 + i * 2,
                  repeat: Infinity,
                  delay: item.delay,
                  ease: "linear"
                }}
              />
            ))}

            {/* Particle System */}
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-1 h-1 bg-white/20 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -100, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 4,
                  repeat: Infinity,
                  delay: Math.random() * 8,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          {/* Quote & Features */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div />
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-4xl lg:text-6xl font-black leading-tight mb-6"
                style={{
                  color: '#F8FAFC',
                  fontFamily: "'Space Grotesk', sans-serif",
                  textShadow: '0 0 40px rgba(99,102,241,0.3)',
                  letterSpacing: '-0.02em'
                }}
              >
                Practice like it's{' '}
                <span className="gradient-text" style={{ fontSize: '1.1em' }}>real.</span>
                <br />
                <span className="text-3xl lg:text-5xl font-light" style={{ color: '#CBD5E1' }}>
                  Perform like it's{' '}
                  <span style={{ color: '#A5B4FC', fontWeight: 700 }}>practice.</span>
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="text-lg lg:text-xl mb-10 leading-relaxed"
                style={{
                  color: '#94A3B8',
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  maxWidth: '600px'
                }}
              >
                AI-powered peer-to-peer mock interviews with adaptive roadmaps.
                <br />
                <span className="text-indigo-300 font-medium">Elevate your coding interview skills.</span>
              </motion.p>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: 0.9 + i * 0.15,
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  className="glass-morphism px-5 py-3 rounded-full cursor-default select-none"
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(12px)',
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 500
                  }}
                >
                  <span className="text-lg mr-2">{feature.icon}</span>
                  <span style={{ color: '#E2E8F0', fontSize: '0.95rem' }}>{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Half — Login */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-8 morph-bg">
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-sm glass-morphism-strong p-8 animate-gentle-float"
          >
            {/* Logo */}
            <motion.div
              className="flex items-center gap-4 mb-3"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  boxShadow: '0 0 25px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                }}
              >
                IM
              </div>
              <div>
                <h2
                  className="gradient-text text-3xl font-black tracking-tight"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    letterSpacing: '-0.02em'
                  }}
                >
                  InterviewMesh
                </h2>
                <p
                  className="text-xs opacity-60 font-medium"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: '#94A3B8'
                  }}
                >
                  AI-Powered Mock Interviews
                </p>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-sm mb-10 leading-relaxed"
              style={{
                color: '#94A3B8',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 400
              }}
            >
              Join thousands of developers preparing for their dream roles through collaborative, AI-enhanced practice sessions.
            </motion.p>

            {/* Google Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              whileHover={{
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              id="google-login-btn"
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:shadow-lg active:scale-[0.98] mb-4 glass-card interactive-element"
              style={{
                background: '#FFFFFF',
                color: '#1F2937',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </motion.button>

            {/* Demo Login Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{
                scale: 1.02,
                y: -1,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDemoLogin}
              className="w-full btn-glow mb-6"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              Demo Login (For Judges)
            </motion.button>

            {/* Optional Resume Parser */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="glass-card p-6 rounded-[2rem] border border-white/10 mb-6"
              style={{ background: 'rgba(15,23,42,0.78)' }}
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-base font-semibold text-white">Resume parsing for your roadmap</p>
                  <p className="text-sm text-slate-400 max-w-[320px]">
                    Upload a PDF or image to auto-generate strengths, weak topics, and better interview focus.
                  </p>
                </div>
                <span className="pill pill-primary">Optional</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                  <label className="block text-xs font-medium uppercase tracking-[0.16em] mb-2 text-slate-300">
                    Upload resume
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    onChange={(event) => handleResumeFileChange(event)}
                    className="w-full text-sm text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-violet-500 file:to-indigo-500 file:text-white"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleParseResume}
                  disabled={parsing}
                  className="btn-glow w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {parsing ? 'Parsing resume...' : 'Parse resume and personalize roadmap'}
                </button>
                {uploadError && <p className="text-xs text-rose-300">{uploadError}</p>}
                {resumeAnalysis && (
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200">
                    <div className="flex items-center justify-between mb-3 gap-3">
                      <div>
                        <p className="font-semibold text-white">Resume insights ready</p>
                        <p className="text-xs text-slate-400">Use these signals to shape your practice roadmap.</p>
                      </div>
                      <span className="pill pill-success">Parsed</span>
                    </div>
                    <p className="text-xs leading-6 text-slate-300 mb-4">{resumeAnalysis.summary}</p>
                    <div className="grid gap-2 text-xs text-slate-400">
                      <p><span className="font-semibold text-slate-100">Strong topics:</span> {resumeAnalysis.strongTopics.join(', ') || 'None detected'}</p>
                      <p><span className="font-semibold text-slate-100">Weak topics:</span> {resumeAnalysis.weakTopics.join(', ') || 'None detected'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex flex-wrap justify-center gap-4 mt-8"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <p
                    className="text-2xl font-black gradient-text mb-1"
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      letterSpacing: '-0.01em'
                    }}
                  >
                    {stat.value}
                  </p>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{
                      color: '#64748B',
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600
                    }}
                  >
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-xs mt-8 opacity-60"
              style={{
                color: '#475569',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500
              }}
            >
              Free for all IIIT Lucknow students • Built with ❤️
            </motion.p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
