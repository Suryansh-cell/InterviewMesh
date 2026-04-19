import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  User, 
  Briefcase, 
  ChevronRight, 
  MessageSquare,
  Trophy,
  Target
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import RoadmapView from '../components/RoadmapView';
import PageTransition from '../components/PageTransition';
import { SkeletonStats, SkeletonTable } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

// Mock performance data
const performanceData = [
  { day: 'Mon', technical: 65, communication: 45, confidence: 50 },
  { day: 'Tue', technical: 70, communication: 55, confidence: 58 },
  { day: 'Wed', technical: 68, communication: 62, confidence: 60 },
  { day: 'Thu', technical: 85, communication: 70, confidence: 75 },
  { day: 'Fri', technical: 82, communication: 75, confidence: 80 },
  { day: 'Sat', technical: 90, communication: 85, confidence: 88 },
  { day: 'Sun', technical: 94, communication: 82, confidence: 92 },
];

function ReadinessScore({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="160" height="160" className="transform -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#readinessGradient)"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="readinessGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
        <span className="text-4xl font-black text-white tracking-tighter">{score}%</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Readiness</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const statsRes = await api.get(`/api/users/${user.id}/stats`);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-[#0F172A]">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          {/* Top Padding for fixed items if any */}
          <div className="max-w-[1600px] mx-auto p-12 space-y-12">
            
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* Welcome Header */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex-1 premium-card p-10 flex flex-col md:flex-row items-center justify-between gap-10"
              >
                <div className="space-y-6 max-w-lg">
                  <div className="space-y-2">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Personal Insight</h2>
                    <h1 className="text-5xl font-black tracking-tighter text-white">
                      Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
                    </h1>
                  </div>
                  <p className="text-lg font-medium opacity-60 leading-relaxed">
                    You've improved your <span className="text-indigo-400">Technical Knowledge</span> by <span className="text-emerald-400">12%</span> this week. Keep up the momentum!
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="space-y-1">
                      <div className="text-xs font-black opacity-40 uppercase tracking-widest">Global ELO</div>
                      <div className="text-2xl font-black text-indigo-400">#{stats?.elo_score || 1200}</div>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="space-y-1">
                      <div className="text-xs font-black opacity-40 uppercase tracking-widest">Sessions</div>
                      <div className="text-2xl font-black text-emerald-400">{stats?.sessions_done || 0}</div>
                    </div>
                  </div>
                </div>
                
                <ReadinessScore score={88} />
              </motion.div>

              {/* Upcoming Session Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-[400px] premium-card p-8 bg-indigo-500/5 border-indigo-500/20 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/20 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                      <Calendar size={12} />
                      Next Session
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Today</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white tracking-tight">Backend Architect</h3>
                      <p className="text-sm font-medium opacity-50">Stripe Mock Interview Series</p>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                        <Clock size={16} className="text-indigo-400" />
                        14:30 PM (Duration: 45m)
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                        <User size={16} className="text-indigo-400" />
                        AI Interviewer: Vertex-02
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                        <Target size={16} className="text-indigo-400" />
                        Focus: System Design & Scalability
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link to="/match" className="btn-glow w-full py-4 text-sm font-black uppercase tracking-widest">
                    Enter Waiting Room
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Metrics & Feedback Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Performance Metrics Area Charts */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="xl:col-span-2 premium-card p-10 space-y-10"
              >
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Growth Analysis</h2>
                    <h3 className="text-3xl font-black tracking-tighter text-white">Performance Metrics</h3>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366F1]" />
                       <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Technical</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_8px_#8B5CF6]" />
                       <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Communication</span>
                    </div>
                  </div>
                </div>

                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTechnical" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1E293B', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="technical" 
                        stroke="#6366F1" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorTechnical)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="communication" 
                        stroke="#8B5CF6" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorComm)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recent Feedback Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="premium-card p-10 space-y-10"
              >
                <div className="space-y-1">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400">Recent Feedback</h2>
                  <h3 className="text-3xl font-black tracking-tighter text-white">Takeaways</h3>
                </div>

                <div className="space-y-6">
                  {[
                    { title: 'Confidence Strike', content: 'Strong eye contact and pacing during the System Design segment.', score: 85, color: '#10B981', icon: <MessageSquare size={16} /> },
                    { title: 'Technical Gap', content: 'Improve explanation of ACID properties in distributed environments.', score: 62, color: '#F59E0B', icon: <Target size={16} /> },
                    { title: 'Peer Review', content: 'Collaborative and articulate. Great at handling follow-up questions.', score: 91, color: '#6366F1', icon: <User size={16} /> }
                  ].map((feedback, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ x: 5 }}
                      className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-3 cursor-default transition-all hover:bg-white/[0.08]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                             {feedback.icon}
                          </div>
                          <span className="text-sm font-black text-white">{feedback.title}</span>
                        </div>
                        <span className="text-xs font-black" style={{ color: feedback.color }}>{feedback.score}%</span>
                      </div>
                      <p className="text-xs font-bold leading-relaxed opacity-50">{feedback.content}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link to="/reports" className="group flex items-center justify-between p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 transition-all hover:bg-indigo-500/20">
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-400">All Session Log</span>
                    <ChevronRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Roadmap or Activity can go here if needed, but the user specifically asked for these 4 sections */}
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
