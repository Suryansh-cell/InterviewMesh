import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  History, 
  Settings, 
  LogOut,
  Map,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Gamepad2, label: 'Practice', path: '/match' },
    { icon: Map, label: 'Roadmap', path: '/roadmap' },
    { icon: History, label: 'History', path: '/dashboard#history' },
    { icon: Settings, label: 'Settings', path: '/setup' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex flex-col glass-morphism border-r border-white/8 sticky top-0 animate-gentle-float transition-all duration-300 ${collapsed ? 'w-20' : 'w-72'}`}
    >
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className={`flex items-center gap-3 transition-all ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            IM
          </div>
          {!collapsed && (
            <div>
              <span className="text-xl font-black tracking-tighter text-white leading-tight">
                InterviewMesh
              </span>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 mt-1">Interview AI</p>
            </div>
          )}
        </div>

        <button
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-1">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Link
              to={item.path}
              title={item.label}
              className={`flex items-center ${collapsed ? 'justify-center' : ''} gap-3 ${collapsed ? 'px-3' : 'px-4'} py-3 rounded-xl text-sm font-bold transition-all duration-300 group interactive-element ${
                isActive(item.path) 
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                  : 'text-slate-400 hover:bg-white/8 hover:text-white hover:shadow-md'
              }`}
            >
              <item.icon size={20} className={`transition-all duration-300 ${isActive(item.path) ? 'text-indigo-400 scale-110' : 'group-hover:text-white group-hover:scale-105'}`} />
              {!collapsed && item.label}
              {isActive(item.path) && !collapsed && (
                <motion.div
                  layoutId="sidebarIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_#6366F1] animate-pulse-glow"
                />
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      {/* Footer / Profile */}
      <div className={`p-6 border-t border-white/5 transition-all ${collapsed ? 'items-center text-center' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center gap-2' : 'items-center gap-3'} px-2`}>
          {user?.name && (
            <img 
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=6366f1`}
              className="w-10 h-10 rounded-xl ring-2 ring-white/5 transition-all"
              alt="Avatar"
            />
          )}
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-200 truncate">{user?.name}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Pro Account</span>
            </div>
          )}
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className={`w-full flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 mt-4 px-4 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200`}
        >
          <LogOut size={20} />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </motion.div>
  );
}
