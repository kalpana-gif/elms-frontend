import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    uid: string | null;
    role: string | null;
    username: string | null;
    login: (uid: string, role: string, username: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            uid: null,
            role: null,
            username: null,
            login: (uid, role, username) => {
                set({ uid, role, username });
            },
            logout: () => {
                set({ uid: null, role: null, username: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
