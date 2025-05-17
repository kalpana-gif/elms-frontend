import { create } from 'zustand';

interface AuthState {
    role: string | null;
    login: (role: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    role: null,
    login: (role: string) => set({ role }),
    logout: () => set({ role: null }),
}));
