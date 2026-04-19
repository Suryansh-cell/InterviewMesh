import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { useSocket } from './hooks/useSocket';

// Pages
import Login from './pages/Login';
import AuthSuccess from './pages/AuthSuccess';
import SetupProfile from './pages/SetupProfile';
import Dashboard from './pages/Dashboard';
import MatchFinder from './pages/MatchFinder';
import Roadmap from './pages/Roadmap';
import Session from './pages/Session';
import Report from './pages/Report';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm" style={{ color: '#94A3B8' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Login />} />
        <Route path="/login-success" element={<AuthSuccess />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route
          path="/setup"
          element={
            <ProtectedRoute>
              <SetupProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Roadmap />
            </ProtectedRoute>
          }
        />
        <Route
          path="/match"
          element={
            <ProtectedRoute>
              <MatchFinder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/session/:roomId"
          element={
            <ProtectedRoute>
              <Session />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:sessionId"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function GlobalNotificationListener() {
  const { user } = useAuthStore();
  const matchSocket = useSocket('match');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const unsubscribeIncoming = matchSocket.on('incoming-match', ({ roomId, from }: any) => {
      console.log('📡 GLOBAL: Received incoming match invitation:', { roomId, from });
      toast((t) => (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="live-dot" />
            <p className="font-bold text-slate-100">Connect with {from.name}?</p>
          </div>
          <p className="text-xs text-slate-400">They are ready to start a session with you.</p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigate(`/session/${roomId}`);
              }}
              className="px-3 py-1 bg-indigo-500 text-white rounded text-xs font-bold hover:bg-indigo-600 transition-colors"
            >
              Join Now
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs font-bold hover:bg-slate-600 transition-colors"
            >
              Ignore
            </button>
          </div>
        </div>
      ), {
        duration: 10000,
        position: 'top-right',
        style: { background: '#1E293B', color: '#F8FAFC', border: '1px solid rgba(255,255,255,0.1)', padding: '16px' },
      });
    });

    return () => {
      unsubscribeIncoming();
    };
  }, [matchSocket, user, navigate]);

  return null;
}

export default function App() {
  const { fetchUser, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      useAuthStore.setState({ isLoading: false });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <BrowserRouter>
        <GlobalNotificationListener />
        <AnimatedRoutes />
      </BrowserRouter>
      <Toaster />
    </div>
  );
}
