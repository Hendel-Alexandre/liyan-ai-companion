import {
    createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { bootstrapUser } from '@/services/authService';

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isConfigured: boolean;
    signUp: (email: string, password: string) => Promise<{ error: string | null }>;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signInMagicLink: (email: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
    user: null, session: null, loading: true, isConfigured: false,
    signUp: async () => ({ error: null }),
    signIn: async () => ({ error: null }),
    signInMagicLink: async () => ({ error: null }),
    signOut: async () => { },
});

const SUPABASE_CONFIGURED =
    !!import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!SUPABASE_CONFIGURED) { setLoading(false); return; }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen to auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                if (event === 'SIGNED_IN' && session?.user) {
                    await bootstrapUser(session.user.id, session.user.email);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signUp = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message ?? null };
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    }, []);

    const signInMagicLink = useCallback(async (email: string) => {
        const { error } = await supabase.auth.signInWithOtp({ email });
        return { error: error?.message ?? null };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    return (
        <AuthContext.Provider value={{
            user, session, loading, isConfigured: SUPABASE_CONFIGURED,
            signUp, signIn, signInMagicLink, signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
