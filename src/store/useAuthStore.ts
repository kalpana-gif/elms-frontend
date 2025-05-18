// src/store/useAuthStore.ts
import { create } from 'zustand';

interface AuthState {
    role: string | null;
    login: (role: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    role: localStorage.getItem('userRole') || null,
    login: (role) => {
        localStorage.setItem('userRole', role);
        set({ role });
    },
    logout: () => {
        localStorage.removeItem('userRole');
        set({ role: null });
    },
}));
