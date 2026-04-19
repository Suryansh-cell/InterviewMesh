import { create } from 'zustand';
import api from '../api/axios';

interface User {
  id: number;
  name: string;
  email: string;
  elo_score: number;
  rating: number;
  skill_tags: string[];
  void_skills: string[];
  free_slots: any[];
  is_online: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true,

  login: async (token: string) => {
    localStorage.setItem('token', token);
    set({ token, isAuthenticated: true });
    await get().fetchUser();
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/api/users/me');
      set({ user: res.data, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem('token');
    }
  },

  updateUser: async (data: Partial<User>) => {
    const user = get().user;
    if (!user) return;
    try {
      const res = await api.patch(`/api/users/${user.id}`, data);
      set({ user: res.data });
    } catch (err) {
      console.error('Update user error:', err);
      throw err;
    }
  },
}));
