import React from 'react';
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
        <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://source.unsplash.com/1920x1080/?coding,dark')`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15,23,42,0.78)' }}
          />

          {/* Quote & Features */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full">
            <div />
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6"
                style={{ color: '#F8FAFC' }}
              >
                Practice like it's real.
                <br />
                <span className="gradient-text">Perform like it's practice.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg mb-10"
                style={{ color: '#94A3B8' }}
              >
                Peer-to-peer mock interviews with AI-powered adaptive roadmaps.
              </motion.p>
            </div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              {FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="pill"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                  }}
                >
                  <span>{feature.icon}</span>
                  <span style={{ color: '#E2E8F0' }}>{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Right Half — Login */}
        <div className="w-full lg:w-[40%] flex items-center justify-center p-8"
          style={{ background: '#0F172A' }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full max-w-sm"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                IM
              </div>
              <h2 className="gradient-text text-2xl font-extrabold tracking-tight">
                InterviewMesh
              </h2>
            </div>
            <p className="text-sm mb-10" style={{ color: '#94A3B8' }}>
              Your AI-powered interview partner
            </p>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              id="google-login-btn"
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg active:scale-[0.98] mb-3"
              style={{
                background: '#FFFFFF',
                color: '#1F2937',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Demo Login Button */}
            <button
              onClick={handleDemoLogin}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all hover:shadow-lg active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#FFFFFF',
                boxShadow: '0 4px 20px rgba(99,102,241,0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              Demo Login (For Judges)
            </button>

            {/* Stats */}
            <div className="flex justify-center gap-4 mt-10">
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-center"
                >
                  <p className="text-lg font-bold gradient-text">{stat.value}</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <p className="text-center text-xs mt-10" style={{ color: '#475569' }}>
              Free for all IIIT Lucknow students
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
