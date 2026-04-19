import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  History, 
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Gamepad2, label: 'Practice', path: '/match' },
    { icon: History, label: 'History', path: '/dashboard#history' },
    { icon: Settings, label: 'Settings', path: '/setup' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 min-h-screen flex flex-col border-r border-white/5 bg-[#0B0F1A]/50 backdrop-blur-3xl sticky top-0">
      {/* Brand */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            IM
          </div>
          <span className="text-xl font-black tracking-tighter text-white">
            InterviewMesh
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
              isActive(item.path) 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={20} className={`transition-colors ${isActive(item.path) ? 'text-indigo-400' : 'group-hover:text-white'}`} />
            {item.label}
            {isActive(item.path) && (
              <motion.div
                layoutId="sidebarIndicator"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366F1]"
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 px-2">
          {user?.name && (
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=6366f1`}
              className="w-10 h-10 rounded-xl ring-2 ring-white/5 group-hover:ring-indigo-500/50 transition-all"
              alt="Avatar"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-200 truncate">{user?.name}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Pro Account</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
