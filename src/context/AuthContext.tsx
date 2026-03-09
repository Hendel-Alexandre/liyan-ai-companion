import {
    createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from 'react';
import { api } from '@/lib/api';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
    user: null, loading: true,
    signUp: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signOut: () => { },
});

const TOKEN_KEY = 'liyan_token';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) { setLoading(false); return; }
        api.auth.me()
            .then(({ user: u }) => setUser(u))
            .catch(() => localStorage.removeItem(TOKEN_KEY))
            .finally(() => setLoading(false));
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        try {
            const { token, user: u } = await api.auth.signup(email, password);
            localStorage.setItem(TOKEN_KEY, token);
            setUser(u);
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Signup failed' };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { token, user: u } = await api.auth.signin(email, password);
            localStorage.setItem(TOKEN_KEY, token);
            setUser(u);
            return { error: null };
        } catch (err: any) {
            return { error: err.message || 'Sign in failed' };
        }
    }, []);

    const signOut = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
