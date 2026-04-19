import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: '#0F172A' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.img
            src="https://source.unsplash.com/800x600/?lost,space"
            alt="Lost in space"
            className="w-full h-56 object-cover rounded-2xl mb-8 opacity-85 border"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <h1 className="text-5xl font-extrabold mb-3">
            <span className="gradient-text">404</span>
          </h1>
          <p className="text-xl font-semibold mb-2" style={{ color: '#E2E8F0' }}>
            404 — Lost in Space
          </p>
          <p className="text-sm mb-8" style={{ color: '#94A3B8' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>

          <Link to="/dashboard" className="btn-glow">
            ← Back to Dashboard
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}
