import { create } from 'zustand';

interface AuthState {
    role: string | null;
    username: string | null;
    login: (role: string, username: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    role: null,
    username: null,
    login: (role, username) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userRole', role);
            localStorage.setItem('userName', username);
        }
        set({ role, username }); // ✅ update both role and username
    },
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userRole');
            localStorage.removeItem('userName');
        }
        set({ role: null, username: null }); // ✅ clear both on logout
    },
}));
