import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
            login: (uid, role, username) =>
                set(() => ({ uid, role, username }), false),
            logout: () => set(() => ({ uid: null, role: null, username: null }), false),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                uid: state.uid,
                role: state.role,
                username: state.username,
            }),
            skipHydration: true,
        }
    )
);
