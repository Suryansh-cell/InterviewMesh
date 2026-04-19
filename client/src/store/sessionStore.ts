import { create } from 'zustand';

interface ChatMessage {
  message: string;
  sender: string;
  timestamp: number;
}

interface QuizQuestion {
  topic: string;
  difficulty: string;
  question: string;
  hint: string;
  expectedAnswer: string;
}

interface SessionState {
  roomId: string | null;
  sessionId: string | null;
  peerId: string | null;
  peerName: string | null;
  isConnected: boolean;
  code: string;
  language: string;
  chatMessages: ChatMessage[];
  currentQuestion: QuizQuestion | null;
  integrityScore: number;
  integrityStatus: string;
  sessionTimer: number;
  
  setRoom: (roomId: string, sessionId?: string) => void;
  setPeer: (peerId: string, peerName: string) => void;
  setConnected: (connected: boolean) => void;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setCurrentQuestion: (q: QuizQuestion | null) => void;
  setIntegrityScore: (score: number, status: string) => void;
  setSessionTimer: (time: number) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  roomId: null,
  sessionId: null,
  peerId: null,
  peerName: null,
  isConnected: false,
  code: '// Start coding here...\n\nfunction solution() {\n  \n}\n',
  language: 'javascript',
  chatMessages: [],
  currentQuestion: null,
  integrityScore: 100,
  integrityStatus: 'clean',
  sessionTimer: 0,

  setRoom: (roomId, sessionId) => set({ roomId, sessionId: sessionId || roomId }),
  setPeer: (peerId, peerName) => set({ peerId, peerName }),
  setConnected: (connected) => set({ isConnected: connected }),
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  addChatMessage: (msg) => set((state) => ({ 
    chatMessages: [...state.chatMessages.slice(-50), msg] 
  })),
  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  setIntegrityScore: (score, status) => set({ integrityScore: score, integrityStatus: status }),
  setSessionTimer: (time) => set({ sessionTimer: time }),
  resetSession: () => set({
    roomId: null,
    sessionId: null,
    peerId: null,
    peerName: null,
    isConnected: false,
    code: '// Start coding here...\n\nfunction solution() {\n  \n}\n',
    language: 'javascript',
    chatMessages: [],
    currentQuestion: null,
    integrityScore: 100,
    integrityStatus: 'clean',
    sessionTimer: 0,
  }),
}));
