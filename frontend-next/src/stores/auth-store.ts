import { create } from 'zustand';
import type { User } from 'firebase/auth';
import type { Subscription } from '@/lib/types';

interface AuthState {
  user: User | null;
  subscription: Subscription;
  loading: boolean;
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscription: { tier: 'free', status: 'active' },
  loading: true,
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setLoading: (loading) => set({ loading }),
}));
