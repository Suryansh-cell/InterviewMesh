import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      login(token).then(() => {
        navigate('/setup', { replace: true });
      });
    } else {
      navigate('/', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F172A' }}>
      <div className="text-center">
        <div className="w-12 h-12 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" 
          style={{ borderWidth: '3px' }} />
        <p className="text-sm font-medium" style={{ color: '#94A3B8' }}>
          Authenticating...
        </p>
      </div>
    </div>
  );
}
