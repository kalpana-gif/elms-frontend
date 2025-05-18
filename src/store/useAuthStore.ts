import { create } from 'zustand';

interface AuthState {
    role: string | null;
    login: (role: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    role: null,
    login: (role) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', role);
        }
        set({ role });
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userRole');
        }
        set({ role: null });
    },
}));

export const initializeAuthStore = () => {
    if (typeof window !== 'undefined') {
        const role = localStorage.getItem('userRole');
        if (role) {
            useAuthStore.getState().login(role);
        }
    }
};
