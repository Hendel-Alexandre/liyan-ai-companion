import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

type Mode = 'signin' | 'signup';

const AuthScreen = () => {
    const { signIn, signUp } = useAuth();
    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { error: e } = await signUp(email, password);
                if (e) setError(e);
            } else {
                const { error: e } = await signIn(email, password);
                if (e) setError(e);
            }
        } finally {
            setLoading(false);
        }
    };

    const inp: React.CSSProperties = {
        width: '100%', fontSize: 15, background: 'var(--surface)',
        color: 'var(--text)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '12px 14px', outline: 'none',
        boxSizing: 'border-box',
    };
    const btn: React.CSSProperties = {
        width: '100%', padding: '13px', fontSize: 15, fontWeight: 700,
        background: 'var(--accent)', color: 'var(--accent-text)',
        border: 'none', borderRadius: 12, cursor: 'pointer',
    };
    const ghost: React.CSSProperties = {
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--accent)', fontSize: 13, padding: 0,
    };

    return (
        <div style={{
            height: '100dvh', background: 'var(--bg)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '32px 20px',
        }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
                <div style={{
                    width: 64, height: 64, borderRadius: 20,
                    background: 'var(--accent)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', fontSize: 28,
                    boxShadow: '0 8px 24px rgba(var(--accent-rgb),0.3)',
                }}>
                    🌙
                </div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.04em', margin: 0 }}>
                    Liyan AI
                </h1>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                    Your Islamic companion
                </p>
            </div>

            <div style={{
                width: '100%', maxWidth: 380,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 24,
            }}>
                <AnimatePresence mode="wait">
                    <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', margin: '0 0 20px' }}>
                            {mode === 'signin' ? 'Welcome back' : 'Create account'}
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                            <input
                                type="email" placeholder="Email address" value={email}
                                onChange={e => setEmail(e.target.value)} style={inp}
                            />
                            <input
                                type="password" placeholder="Password (min 8 chars)" value={password}
                                onChange={e => setPassword(e.target.value)} style={inp}
                                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                            />

                            {error && (
                                <p style={{ fontSize: 12, color: '#EF4444', lineHeight: 1.45 }}>
                                    {error}
                                </p>
                            )}

                            <button style={{ ...btn, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
                                {loading ? '…' : mode === 'signup' ? 'Create account' : 'Sign in'}
                            </button>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 18 }}>
                            {mode === 'signin' ? (
                                <button style={ghost} onClick={() => { setMode('signup'); setError(null); }}>
                                    Don't have an account? Create one
                                </button>
                            ) : (
                                <button style={ghost} onClick={() => { setMode('signin'); setError(null); }}>
                                    Already have an account? Sign in
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 24, textAlign: 'center', lineHeight: 1.7 }}>
                Liyan AI is not a substitute for qualified Islamic scholarship.
            </p>
        </div>
    );
};

export default AuthScreen;
