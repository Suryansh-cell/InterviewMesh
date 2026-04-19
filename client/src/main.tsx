import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            fontSize: '0.875rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: { primary: '#10B981', secondary: '#F8FAFC' },
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' },
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
);
