import { useState, useRef } from 'react';
import { Mic, Upload, RotateCcw, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { recognizeQuran } from '@/services/quranRecognitionService';
import { useSaved } from '@/context/SavedContext';
import type { RecognitionResult } from '@/services/types';

type State = 'idle' | 'recording' | 'loading' | 'success' | 'notfound' | 'error';

interface Props {
    onNavigateRecite?: () => void;
}

export const QuranRecognitionWidget = ({ onNavigateRecite }: Props) => {
    const [state, setState] = useState<State>('idle');
    const [result, setResult] = useState<RecognitionResult | null>(null);
    const { addItem } = useSaved();

    const recognize = async () => {
        setState('loading');
        try {
            const r = await recognizeQuran();
            setResult(r);
            setState(r.found ? 'success' : 'notfound');
        } catch {
            setState('error');
        }
    };

    const saveResult = () => {
        if (!result?.found) return;
        addItem({
            id: `rec-${result.surahNumber}-${result.ayahNumber}-${Date.now()}`,
            title: `${result.surahName} ${result.surahNumber}:${result.ayahNumber}`,
            snippet: result.translation || '',
            category: 'Recitations',
            fullContent: `${result.arabic}\n\n${result.transliteration}\n\n${result.translation}\n\nReciter: ${result.reciter}`,
        });
    };

    const reset = () => { setState('idle'); setResult(null); };

    return (
        <div className="card w-full" style={{ padding: '16px' }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Quran Recognition
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Identify a Recitation</p>
                </div>
                {state !== 'idle' && (
                    <button onClick={reset} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <RotateCcw size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* Idle */}
                {state === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
                            Record or upload audio to identify the surah, ayah, and reciter.
                        </p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <motion.button
                                whileTap={{ scale: 0.94 }}
                                onClick={recognize}
                                style={{ flex: 1, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--accent)', borderRadius: 12, border: 'none', cursor: 'pointer' }}
                            >
                                <Mic size={18} strokeWidth={1.5} style={{ color: 'var(--accent-text)' }} />
                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-text)' }}>Record</span>
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.94 }}
                                onClick={recognize}
                                style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)', cursor: 'pointer' }}
                            >
                                <Upload size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Loading */}
                {state === 'loading' && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                            {[0, 1, 2].map(i => (
                                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.25 }}
                                    style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }}
                                />
                            ))}
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Identifying recitation…</p>
                    </motion.div>
                )}

                {/* Success */}
                {state === 'success' && result?.found && (
                    <motion.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px' }}>
                                {Math.round((result.confidence || 0.9) * 100)}% match
                            </span>
                        </div>
                        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>
                            {result.surahName} · {result.surahNumber}:{result.ayahNumber}
                        </p>
                        {result.reciter && (
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{result.reciter}</p>
                        )}
                        {result.arabic && (
                            <p dir="rtl" style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: 18, lineHeight: 1.9, color: 'var(--text)', marginBottom: 8, textAlign: 'right' }}>
                                {result.arabic}
                            </p>
                        )}
                        {result.translation && (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 14 }}>
                                "{result.translation}"
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={saveResult} style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: 'var(--accent-text)', borderRadius: 10, border: 'none', cursor: 'pointer' }}>Save</button>
                            <button onClick={onNavigateRecite} style={{ flex: 1, height: 40, fontSize: 13, fontWeight: 600, background: 'var(--surface2)', color: 'var(--text)', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <BookOpen size={14} strokeWidth={1.5} />Open
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Not found */}
                {state === 'notfound' && (
                    <motion.div key="notfound" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '12px 0' }}>
                        <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>Recitation not recognized</p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Try recording a longer passage or upload a clearer audio.
                        </p>
                    </motion.div>
                )}

                {/* Error */}
                {state === 'error' && (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ textAlign: 'center', padding: '12px 0' }}>
                        <p style={{ fontSize: 14, color: '#EF4444' }}>Something went wrong. Please try again.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
