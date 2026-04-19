import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    // Set a timeout to show error if authentication takes too long
    const timeoutId = setTimeout(() => {
      setTimedOut(true);
    }, 10000);

    if (token) {
      login(token)
        .then(() => {
          clearTimeout(timeoutId);
          navigate('/setup', { replace: true });
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          console.error('Auth success error:', err);
          toast.error('Authentication failed. Please try again.');
          navigate('/', { replace: true });
        });
    } else {
      clearTimeout(timeoutId);
      navigate('/', { replace: true });
    }

    return () => clearTimeout(timeoutId);
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0F172A' }}>
      <div className="max-w-md w-full text-center space-y-8">
        {!timedOut ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="absolute inset-0 border-4 border-indigo-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Authenticating...</h1>
              <p className="text-sm font-medium text-slate-400">Verifying session with InterviewMesh servers</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="premium-card p-10 space-y-6 border-rose-500/20"
          >
             <div className="w-16 h-16 bg-rose-500/10 rounded-[22px] flex items-center justify-center mx-auto text-rose-500 mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
             </div>
             <div className="space-y-2">
               <h2 className="text-xl font-black text-white">Connection Timeout</h2>
               <p className="text-sm text-slate-400 leading-relaxed">
                 The server is taking too long to respond. This might be due to database connectivity issues in your region.
               </p>
             </div>
             <button 
               onClick={() => navigate('/')}
               className="w-full btn-glow btn-secondary py-3 text-sm font-black uppercase tracking-widest"
             >
               Return to Landing
             </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
