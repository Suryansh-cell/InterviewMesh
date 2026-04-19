import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import PageTransition from '../components/PageTransition';
import toast from 'react-hot-toast';

const SKILLS = [
  'DSA', 'LLD', 'HLD', 'OS', 'DBMS', 'CN',
  'Spring Boot', 'System Design', 'React', 'Node.js', 'Python', 'DevOps',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '6:00-8:00', '8:00-10:00', '10:00-12:00', '12:00-14:00',
  '14:00-16:00', '16:00-18:00', '18:00-20:00', '20:00-22:00', '22:00-00:00',
];

export default function SetupProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [skills, setSkills] = useState<string[]>(user?.skill_tags || []);
  const [voidSkills, setVoidSkills] = useState<string[]>(user?.void_skills || []);
  const [freeSlots, setFreeSlots] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    (user?.free_slots || []).forEach((slot: any) => {
      if (slot?.day && slot?.start && slot?.end) {
        map[`${slot.day}-${slot.start}-${slot.end}`] = true;
      }
    });
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<any>(null);
  const [resumeParsing, setResumeParsing] = useState(false);
  const [resumeError, setResumeError] = useState('');

  useEffect(() => {
    if (!user) return;
  }, [user]);

  const toggleSkill = (skill: string) => {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleVoidSkill = (skill: string) => {
    setVoidSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setFreeSlots((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleResumeFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResumeError('');
    setResumeAnalysis(null);
    const file = event.target.files?.[0] || null;
    setResumeFile(file);
  };

  const handleParseResume = async () => {
    if (!resumeFile) {
      setResumeError('Please select a PDF or image resume first.');
      return;
    }

    setResumeParsing(true);
    setResumeError('');

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Unable to parse resume');
      }

      setResumeAnalysis(data);
      toast.success('Resume analysis completed');
    } catch (error: any) {
      setResumeError(error?.message || 'Resume parse failed.');
    } finally {
      setResumeParsing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const slots = Object.entries(freeSlots)
        .filter(([, active]) => active)
        .map(([key]) => {
          const [day, start, end] = key.split('-');
          return { day, start, end };
        });

      await updateUser({
        skill_tags: skills,
        void_skills: voidSkills,
        free_slots: slots as any,
      });

      toast.success('Profile saved! 🎉');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 2) return skills.length > 0;
    if (step === 3) return voidSkills.length > 0;
    return true;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#07101f] py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.95fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-8 shadow-[0_25px_80px_rgba(15,23,42,0.25)]"
            >
              <div className="mb-6">
                <p className="text-sm uppercase tracking-[0.32em] text-indigo-300">Welcome back</p>
                <h1 className="mt-3 text-4xl font-semibold text-white leading-tight">
                  {user?.name ? `Hi ${user.name.split(' ')[0]}, let’s sharpen your interview profile` : 'Setup your InterviewMesh profile'}
                </h1>
                <p className="mt-4 max-w-2xl text-sm text-slate-300">
                  Upload your resume to auto-suggest strengths and weak topics, then customize your skills and availability for smarter mock sessions.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Skill focus</p>
                  <p className="mt-2 text-xl font-semibold text-white">{skills.length || 0}</p>
                  <p className="mt-1 text-sm text-slate-400">Selected skills for practice</p>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Availability</p>
                  <p className="mt-2 text-xl font-semibold text-white">{Object.values(freeSlots).filter(Boolean).length}</p>
                  <p className="mt-1 text-sm text-slate-400">Time slots ready for pairing</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-card p-6 shadow-[0_25px_80px_rgba(15,23,42,0.25)]"
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-indigo-300">Resume insight</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Upload resume</h2>
                </div>
                <span className="pill pill-primary">Optional</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Get resume-driven topic suggestions without leaving setup.
              </p>
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-4">
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  onChange={handleResumeFileChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-inner shadow-black/20 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-violet-500 file:to-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
                <button
                  type="button"
                  onClick={handleParseResume}
                  disabled={resumeParsing}
                  className="btn-glow mt-4 w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resumeParsing ? 'Parsing resume...' : 'Analyze resume and personalize profile'}
                </button>
                {resumeError && <p className="mt-3 text-xs text-rose-300">{resumeError}</p>}
                {resumeAnalysis && (
                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200">
                    <p className="text-sm font-semibold text-white">Resume summary</p>
                    <p className="mt-3 leading-6 text-slate-300">{resumeAnalysis.summary}</p>
                    <div className="mt-4 grid gap-3 text-xs text-slate-400">
                      <p><span className="font-semibold text-slate-100">Strong topics:</span> {resumeAnalysis.strongTopics.join(', ') || 'None'}</p>
                      <p><span className="font-semibold text-slate-100">Weak topics:</span> {resumeAnalysis.weakTopics.join(', ') || 'None'}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="glass-card p-8 shadow-[0_25px_80px_rgba(15,23,42,0.25)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Setup progress</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Complete your profile</h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="pill pill-success">{step === 1 ? 'Resume' : step === 2 ? 'Strong' : step === 3 ? 'Goal' : 'Availability'}</span>
                <span className="pill pill-primary">Step {step} of 4</span>
              </div>
            </div>

            <div className="mb-8 grid gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-center">
                  <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${step >= index ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'bg-white/5 text-slate-300'}`}>
                    {index}
                  </div>
                  <p className={`text-sm font-semibold ${step >= index ? 'text-white' : 'text-slate-400'}`}>
                    {index === 1 ? 'Resume' : index === 2 ? 'Strong' : index === 3 ? 'Goal' : 'Availability'}
                  </p>
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <p className="text-sm text-slate-400">Upload your resume to let the system learn your strengths and weak points.</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">Resume first</h3>
                  </div>
                  <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/85 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
                    <label className="block text-sm font-semibold text-slate-100">Upload resume</label>
                    <p className="mt-2 text-sm text-slate-400">PDF or image upload will help personalize your roadmap faster.</p>
                    <input
                      type="file"
                      accept="application/pdf,image/png,image/jpeg"
                      onChange={handleResumeFileChange}
                      className="mt-4 w-full rounded-3xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-200 shadow-inner shadow-black/20 file:mr-4 file:rounded-full file:border-0 file:bg-gradient-to-r file:from-violet-500 file:to-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleParseResume}
                      disabled={resumeParsing}
                      className="btn-glow mt-5 w-full py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {resumeParsing ? 'Parsing resume...' : 'Analyze resume now'}
                    </button>
                    {resumeError && <p className="mt-4 text-xs text-rose-300">{resumeError}</p>}
                    {resumeAnalysis && (
                      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-200">
                        <p className="font-semibold text-white">Resume insight</p>
                        <p className="mt-3 leading-6 text-slate-300">{resumeAnalysis.summary}</p>
                        <div className="mt-4 grid gap-3 text-xs text-slate-400">
                          <p><span className="font-semibold text-slate-100">Strong topics:</span> {resumeAnalysis.strongTopics.join(', ') || 'None'}</p>
                          <p><span className="font-semibold text-slate-100">Weak topics:</span> {resumeAnalysis.weakTopics.join(', ') || 'None'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <p className="text-sm text-slate-400">Choose your strongest domains so the app can match you with the right challenge level.</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">Strong topics</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`chip min-w-[110px] ${skills.includes(skill) ? 'selected bg-violet-500 text-white shadow-lg shadow-violet-500/20' : 'border border-white/10 bg-white/5 text-slate-300'}`}
                      >
                        {skills.includes(skill) && <span className="mr-2 text-xs">✓</span>}
                        {skill}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <p className="text-sm text-slate-400">Select areas you want the platform to help you strengthen.</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">Growth goals</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        onClick={() => toggleVoidSkill(skill)}
                        className={`chip min-w-[110px] ${voidSkills.includes(skill) ? 'selected bg-slate-100 text-slate-950 shadow-lg shadow-slate-100/10' : 'border border-white/10 bg-white/5 text-slate-300'}`}
                      >
                        {voidSkills.includes(skill) && <span className="mr-2 text-xs">✓</span>}
                        {skill}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="mb-6">
                    <p className="text-sm text-slate-400">Mark the times when you’re ready for pairing sessions.</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">Availability</h3>
                  </div>
                  <div className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                    <table className="w-full border-separate border-spacing-2 text-sm">
                      <thead>
                        <tr>
                          <th className="p-2 text-left text-xs uppercase tracking-[0.24em] text-slate-500"></th>
                          {DAYS.map((day) => (
                            <th key={day} className="py-2 text-center text-xs uppercase tracking-[0.24em] text-slate-400">
                              {day}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {TIME_SLOTS.map((time) => (
                          <tr key={time}>
                            <td className="p-2 text-xs text-slate-400">{time}</td>
                            {DAYS.map((day) => {
                              const key = `${day}-${time}`;
                              const active = freeSlots[key];
                              return (
                                <td key={key} className="p-1">
                                  <button
                                    onClick={() => toggleSlot(day, time)}
                                    className="h-10 w-full rounded-2xl transition-all"
                                    style={{
                                      background: active ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.05)',
                                      border: `1px solid ${active ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.1)'}`,
                                    }}
                                  />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                className="btn-glow btn-secondary w-full sm:w-auto"
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
              >
                ← Back
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  className="btn-glow w-full sm:w-auto"
                  disabled={!canProceed()}
                  style={{ opacity: canProceed() ? 1 : 0.55 }}
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="btn-glow w-full sm:w-auto"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Finish onboarding'}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
