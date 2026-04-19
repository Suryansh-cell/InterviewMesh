import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

interface QuizQuestion {
  topic: string;
  difficulty: string;
  question: string;
  hint: string;
  expectedAnswer: string;
}

interface QuizPanelProps {
  sessionId: string;
  onSubmit?: (result: any) => void;
}

const TOPICS = ['DSA', 'LLD', 'System Design', 'OS', 'DBMS', 'CN'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export default function QuizPanel({ sessionId, onSubmit }: QuizPanelProps) {
  const { user } = useAuthStore();
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(50);
  const [topicIndex, setTopicIndex] = useState(0);
  const [difficulty, setDifficulty] = useState('medium');
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mlLabel, setMlLabel] = useState<string | null>(null);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const generateQuestion = useCallback(async () => {
    setLoading(true);
    setMlLabel(null);
    setShowHint(false);
    setShowAnswer(false);
    setScore(50);
    setQuestionTimer(0);

    try {
      const res = await api.post('/api/questions/generate', {
        topic: TOPICS[topicIndex % TOPICS.length],
        difficulty,
        userSkills: user?.skill_tags,
        voidSkills: user?.void_skills,
      });
      setCurrentQuestion(res.data);
    } catch {
      toast.error('Could not generate question');
    } finally {
      setLoading(false);
    }
  }, [topicIndex, difficulty, user]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  // Question timer
  useEffect(() => {
    if (!currentQuestion || mlLabel) return;
    const interval = setInterval(() => setQuestionTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [currentQuestion, mlLabel]);

  const handleSubmit = async () => {
    if (!currentQuestion) return;
    setSubmitting(true);
    toast('Quiz submitted — ML analyzing...', { icon: '🤖' });

    // Demo Mode bypass
    if (sessionId.startsWith('demo-')) {
      setTimeout(() => {
        setMlLabel('PROGRESS');
        toast.success('🎉 Great progress! Topic advancing.');
        setSubmitting(false);
      }, 1500);
      return;
    }

    try {
      const res = await api.post('/api/quiz/submit', {
        session_id: sessionId,
        topic: currentQuestion.topic,
        score,
        time_taken: questionTimer,
        difficulty: currentQuestion.difficulty,
      });
      setMlLabel(res.data.ml_label);
      onSubmit?.(res.data);

      const labelMessages: Record<string, string> = {
        PROGRESS: '🎉 Great progress! Topic advancing.',
        WEAK_GAP: '📝 Needs more practice.',
        STRONG_GAP: '📚 Added to your practice queue.',
        RETRY: '🔄 Keep trying, you\'re improving!',
      };
      toast.success(labelMessages[res.data.ml_label] || 'Result recorded');
    } catch {
      toast.error('Failed to submit. Using local bypass.');
      setMlLabel('RETRY');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setTopicIndex((i) => i + 1);
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'PROGRESS': return { bg: 'rgba(16,185,129,0.15)', color: '#34D399', border: 'rgba(16,185,129,0.3)' };
      case 'WEAK_GAP': return { bg: 'rgba(245,158,11,0.15)', color: '#FBBF24', border: 'rgba(245,158,11,0.3)' };
      case 'STRONG_GAP': return { bg: 'rgba(239,68,68,0.15)', color: '#F87171', border: 'rgba(239,68,68,0.3)' };
      case 'RETRY': return { bg: 'rgba(99,102,241,0.15)', color: '#A5B4FC', border: 'rgba(99,102,241,0.3)' };
      default: return { bg: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: 'rgba(255,255,255,0.1)' };
    }
  };

  const timerPercent = Math.min((questionTimer / 180) * 100, 100);
  const timerColor = timerPercent > 66 ? '#EF4444' : timerPercent > 33 ? '#F59E0B' : '#10B981';

  return (
    <div className="flex flex-col h-full bg-[#0B0F1A]/80 backdrop-blur-3xl border-l border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-20" />
      
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-8">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-500/20 rounded-full animate-ping absolute inset-0" />
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin relative z-10" />
            </div>
            <div>
              <h3 className="text-xl font-black gradient-text mb-2">Architecting Question...</h3>
              <p className="text-xs font-bold uppercase tracking-widest opacity-40">Gemini 2.0 Flash is thinking</p>
            </div>
          </div>
        ) : currentQuestion ? (
          <>
            {/* Header Info */}
            <div className="flex items-center justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="pill pill-primary text-[10px] font-black uppercase tracking-widest border-2">{currentQuestion.topic}</span>
                  <span className={`pill text-[10px] font-black uppercase tracking-widest border-2 ${
                    currentQuestion.difficulty === 'hard' ? 'pill-danger' : 
                    currentQuestion.difficulty === 'medium' ? 'pill-warning' : 'pill-success'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Session ID: {sessionId.slice(0, 8)}</p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-xl font-black tracking-tighter mb-1">
                  <span className="opacity-40 text-xs mt-1">TIME</span>
                  <span className={questionTimer > 120 ? 'text-rose-400' : 'text-emerald-400'}>
                    {Math.floor(questionTimer / 60)}:{(questionTimer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${timerPercent}%` }}
                    className="h-full" 
                    style={{ background: timerColor }} 
                  />
                </div>
              </div>
            </div>

            {/* Question Body */}
            <div className="space-y-4">
               <h2 className="text-xs font-black uppercase tracking-widest opacity-40">Primary Question</h2>
               <div className="premium-card p-8 bg-white/5 border-indigo-500/20">
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-lg font-bold leading-relaxed tracking-tight" 
                  style={{ color: '#F8FAFC' }}
                >
                  {currentQuestion.question}
                </motion.p>
              </div>
            </div>

            {/* AI Guidance */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-widest opacity-40">AI Guidance</h2>
                {!showHint && (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Unlock Hint →
                  </button>
                )}
              </div>
              
              {showHint && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"
                >
                  <p className="text-sm font-medium italic text-indigo-200">
                    <span className="font-black not-italic opacity-40 mr-2">HINT:</span> 
                    {currentQuestion.hint}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Scoring / Feedback */}
            {!mlLabel && (
              <div className="space-y-6 pt-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest opacity-40">Submission Scoring</h2>
                  <span className="text-2xl font-black gradient-text tracking-tighter">{score}%</span>
                </div>
                
                <div className="relative px-2">
                   <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <div className="flex justify-between mt-3 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Baseline</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Mastery</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-glow w-full py-4 text-sm font-black uppercase tracking-widest pulse-glow"
                >
                  {submitting ? 'Analyzing Metadata...' : 'Commit Submission'}
                </button>
              </div>
            )}

            {/* ML Results */}
            {mlLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="p-8 rounded-[32px] text-center border-4"
                  style={{
                    background: getLabelColor(mlLabel).bg,
                    borderColor: getLabelColor(mlLabel).border,
                  }}
                >
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Predictive ML Label</p>
                  <h3 className="text-3xl font-black tracking-tighter" style={{ color: getLabelColor(mlLabel).color }}>
                    {mlLabel}
                  </h3>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => setShowAnswer(!showAnswer)}
                    className="w-full p-4 rounded-xl border border-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-colors"
                  >
                    {showAnswer ? 'Hide Golden Response' : 'View Golden Response'}
                  </button>
                  
                  {showAnswer && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20"
                    >
                      <p className="text-sm font-medium leading-relaxed text-emerald-200">
                        {currentQuestion.expectedAnswer}
                      </p>
                    </motion.div>
                  )}
                </div>

                <button onClick={handleNext} className="btn-glow w-full py-4 text-sm font-black uppercase tracking-widest">
                  Iterate Next Case →
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <p className="text-sm font-black uppercase tracking-widest opacity-20">Waiting for Stream...</p>
          </div>
        )}
      </div>

      {/* Footer Settings */}
      <div className="p-6 border-t border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Difficulty Modifier</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">{difficulty}</span>
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                difficulty === d 
                  ? 'bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
