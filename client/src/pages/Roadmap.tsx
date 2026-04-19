import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Award, Clock4, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/Sidebar';
import RoadmapView from '../components/RoadmapView';
import PageTransition from '../components/PageTransition';

const roadmapNodes = [
  { topic: 'DSA', status: 'completed' },
  { topic: 'LLD', status: 'active' },
  { topic: 'System Design', status: 'locked' },
  { topic: 'OS', status: 'locked' },
  { topic: 'DBMS', status: 'locked' },
  { topic: 'CN', status: 'locked' },
];

export default function Roadmap() {
  const { user } = useAuthStore();

  return (
    <PageTransition>
      <div className="flex min-h-screen morph-bg">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-12 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10"
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-2 text-xs uppercase font-black tracking-[0.3em] text-indigo-300">
                    <Sparkles size={14} /> Roadmap
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white">Interview growth plan</h1>
                  <p className="max-w-2xl text-sm opacity-70 leading-relaxed">
                    A dedicated roadmap for your interview preparation. Track milestones, review progress, and stay focused on what matters most.
                  </p>
                </div>

                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/15 transition-all">
                    <ArrowLeft size={16} /> Back to Dashboard
                  </Link>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-white">
                      <Award size={18} className="text-indigo-300" />
                      <span>Current Level: Interview Fast-Track</span>
                    </div>
                    <p className="mt-3 text-xs opacity-60">Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}. Your roadmap adapts as you progress.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-8"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white">Roadmap Overview</h2>
                  <p className="text-sm opacity-60 mt-2">Progress through topics, unlock new milestones, and focus on your current strengths.</p>
                </div>
                <div className="grid grid-cols-3 gap-4 w-full sm:w-auto">
                  {[
                    { label: 'Completed', value: '24', accent: 'bg-emerald-500/10 text-emerald-300' },
                    { label: 'In Progress', value: '3', accent: 'bg-indigo-500/10 text-indigo-300' },
                    { label: 'Upcoming', value: '9', accent: 'bg-white/10 text-slate-300' },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-3xl p-4 ${item.accent}`}>
                      <p className="text-[10px] uppercase tracking-[0.3em] opacity-50">{item.label}</p>
                      <p className="text-3xl font-black mt-2">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <RoadmapView nodes={roadmapNodes} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="glass-card p-6 space-y-4 border border-white/10">
                <div className="flex items-center gap-3 text-indigo-300">
                  <Clock4 size={18} />
                  <span className="text-xs uppercase tracking-[0.3em] font-black">Next Action</span>
                </div>
                <h3 className="text-xl font-black text-white">Mock interview prep</h3>
                <p className="text-sm opacity-70">Schedule a focused mock session for System Design and DSA later this week.</p>
              </div>
              <div className="glass-card p-6 space-y-4 border border-white/10">
                <div className="flex items-center gap-3 text-emerald-300">
                  <Sparkles size={18} />
                  <span className="text-xs uppercase tracking-[0.3em] font-black">Milestone</span>
                </div>
                <h3 className="text-xl font-black text-white">Complete Low-Level Design</h3>
                <p className="text-sm opacity-70">Finish the current design module and review feedback on your last interview.</p>
              </div>
              <div className="glass-card p-6 space-y-4 border border-white/10">
                <div className="flex items-center gap-3 text-white/70">
                  <span className="text-xs uppercase tracking-[0.3em] font-black">Tip</span>
                </div>
                <h3 className="text-xl font-black text-white">Stay consistent</h3>
                <p className="text-sm opacity-70">Use the roadmap board daily and update your next session priorities after each review.</p>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
