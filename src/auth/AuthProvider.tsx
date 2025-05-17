import React, { createContext, useState, ReactNode } from 'react';

interface AuthContextType {
    role: string | null;
    login: (role: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    role: null,
    login: () => {},
    logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<string | null>(() => {
        // Try to read from localStorage (for persistence)
        return localStorage.getItem('userRole');
    });

    const login = (userRole: string) => {
        setRole(userRole);
        localStorage.setItem('userRole', userRole);
    };

    const logout = () => {
        setRole(null);
        localStorage.removeItem('userRole');
    };

    return (
        <AuthContext.Provider value={{ role, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
