import React, { useState } from 'react';
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
    if (step === 1) return skills.length > 0;
    if (step === 2) return voidSkills.length > 0;
    return true;
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: '#0F172A' }}>
        <motion.div
          className="w-full max-w-[680px] glass-card p-8"
          layout
        >
          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1">
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill"
                    style={{ background: s <= step ? '#6366F1' : 'transparent' }}
                    animate={{ width: s <= step ? '100%' : '0%' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs mt-1.5 text-center" style={{ color: s <= step ? '#A5B4FC' : '#475569' }}>
                  {s === 1 ? 'Skills' : s === 2 ? 'Goals' : 'Availability'}
                </p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1 — Skills */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
                  What are you good at? 💪
                </h2>
                <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                  Select skills you're confident in
                </p>
                <div className="flex flex-wrap gap-3">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`chip ${skills.includes(skill) ? 'selected' : ''}`}
                    >
                      {skills.includes(skill) && <span>✓</span>}
                      {skill}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Learning Goals */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
                  What do you want to improve? 🎯
                </h2>
                <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                  Select areas you want to practice
                </p>
                <div className="flex flex-wrap gap-3">
                  {SKILLS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleVoidSkill(skill)}
                      className={`chip ${voidSkills.includes(skill) ? 'selected' : ''}`}
                    >
                      {voidSkills.includes(skill) && <span>✓</span>}
                      {skill}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3 — Availability */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#F8FAFC' }}>
                  When are you free? 📅
                </h2>
                <p className="text-sm mb-6" style={{ color: '#94A3B8' }}>
                  Click cells to mark your available times
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '3px' }}>
                    <thead>
                      <tr>
                        <th className="text-xs font-medium p-1" style={{ color: '#64748B' }}></th>
                        {DAYS.map((day) => (
                          <th key={day} className="text-xs font-medium p-1 text-center" style={{ color: '#94A3B8' }}>
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TIME_SLOTS.map((time) => (
                        <tr key={time}>
                          <td className="text-xs p-1 whitespace-nowrap" style={{ color: '#64748B', fontSize: '0.7rem' }}>
                            {time}
                          </td>
                          {DAYS.map((day) => {
                            const key = `${day}-${time}`;
                            const active = freeSlots[key];
                            return (
                              <td key={key} className="p-0.5">
                                <button
                                  onClick={() => toggleSlot(day, time)}
                                  className="w-full h-7 rounded-md transition-all"
                                  style={{
                                    background: active ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${active ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.06)'}`,
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

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="btn-glow btn-secondary"
              style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
            >
              ← Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="btn-glow"
                disabled={!canProceed()}
                style={{ opacity: canProceed() ? 1 : 0.5 }}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="btn-glow"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Complete Setup ✓'}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
