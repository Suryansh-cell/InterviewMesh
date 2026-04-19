import React from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { UserPlus, Check, X } from 'lucide-react';

interface InviteToastProps {
  t: any;
  callerName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export const InviteToast = ({ t, callerName, onAccept, onDecline }: InviteToastProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-[#1E293B] shadow-2xl rounded-[24px] pointer-events-auto flex ring-1 ring-white/10 overflow-hidden border border-indigo-500/20`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <UserPlus size={24} />
            </div>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-black text-white px-2 py-1 rounded-lg bg-indigo-500/20 inline-block mb-2 uppercase tracking-widest" style={{ fontSize: '0.65rem' }}>
              Session Invite
            </p>
            <p className="text-sm font-bold text-slate-200">
              {callerName} <span className="font-medium text-slate-400">invited you to a mock interview.</span>
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col border-l border-white/5">
        <button
          onClick={() => {
            onAccept();
            toast.dismiss(t.id);
          }}
          className="w-full border-b border-white/5 p-4 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/10 transition-colors"
        >
          <Check size={20} />
        </button>
        <button
          onClick={() => {
            onDecline();
            toast.dismiss(t.id);
          }}
          className="w-full p-4 flex items-center justify-center text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    </motion.div>
  );
};
