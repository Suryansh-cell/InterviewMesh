import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = React.useState<string | null>(null);
  const token = React.useMemo(() => searchParams.get('token'), [searchParams]);

  useEffect(() => {
    if (!token) {
      setError('Missing token in URL. Please try signing in again.');
      return;
    }

    login(token)
      .then(() => {
        navigate('/setup', { replace: true });
      })
      .catch(() => {
        setError('Unable to authenticate with this token. Please go back and try again.');
      });
  }, [token, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b18] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
      >
        <motion.div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-indigo-400 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'linear' }}
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 shadow-xl shadow-violet-500/30" />
        </motion.div>
        <h1 className="text-3xl font-semibold text-white">Signing you in...</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-400">
          Connecting your account and preparing a premium onboarding experience. You’ll be on the resume step shortly.
        </p>
        {error && (
          <div className="mt-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 p-5 text-left text-sm text-rose-100">
            <p className="font-semibold text-rose-200">Authentication issue</p>
            <p className="mt-2 text-rose-100">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Return to sign in
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
