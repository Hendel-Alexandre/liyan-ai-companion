import { useState, useEffect } from 'react';
import { Bookmark, BookMarked } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyDua } from '@/services/duaService';
import { getDailyDuaSync } from '@/services/duaService';
import { useSaved } from '@/context/SavedContext';
import type { Dua } from '@/services/types';

interface Props {
    onExpand?: () => void;
}

export const DailyDuaWidget = ({ onExpand }: Props) => {
    const [dua, setDua] = useState<Dua>(getDailyDuaSync());
    const { addItem, items } = useSaved();
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        getDailyDua().then(setDua);
    }, []);

    const savedId = `dua-${dua.id}`;
    const isSaved = items.some(i => i.id === savedId);

    const save = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSaved) {
            addItem({
                title: dua.title,
                snippet: dua.translation,
                category: 'Duas',
                fullContent: `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}${dua.reference ? '\n\nSource: ' + dua.reference : ''}`,
            });
        }
    };

    return (
        <motion.div
            layout
            onClick={() => setExpanded(e => !e)}
            className="card w-full cursor-pointer"
            style={{ padding: '16px' }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Daily Dua
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 2 }}>
                        {dua.title}
                    </p>
                </div>
                <button onClick={save} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    {isSaved
                        ? <BookMarked size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                        : <Bookmark size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                    }
                </button>
            </div>

            {/* Arabic */}
            <p dir="rtl" style={{ fontFamily: "'Amiri', Georgia, serif", fontSize: 20, lineHeight: 1.9, color: 'var(--text)', marginBottom: 10, textAlign: 'right' }}>
                {dua.arabic}
            </p>

            {/* Translation */}
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{dua.translation}"
            </p>

            {/* Expanded: transliteration + source */}
            <AnimatePresence>
                {expanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.6, fontStyle: 'italic' }}>
                            {dua.transliteration}
                        </p>
                        {dua.reference && (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, opacity: 0.7 }}>
                                Source: {dua.reference}
                            </p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {dua.occasion && (
                <div style={{ marginTop: 12, display: 'inline-block' }}>
                    <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px' }}>
                        {dua.occasion}
                    </span>
                </div>
            )}
        </motion.div>
    );
};