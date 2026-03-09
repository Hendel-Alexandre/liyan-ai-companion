import { useState } from 'react';
import { Bookmark, BookMarked, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyAyahSync } from '@/services/ayahService';
import { useSaved } from '@/context/SavedContext';

interface Props {
    onNavigate?: (tab: string) => void;
}

export const DailyAyahWidget = ({ onNavigate }: Props) => {
    const ayah = getDailyAyahSync();
    const { addItem, items } = useSaved();
    const [expanded, setExpanded] = useState(false);
    const savedId = `ayah-${ayah.surahNumber}-${ayah.ayahNumber}`;
    const isSaved = items.some(i => i.id === savedId);

    const save = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isSaved) {
            addItem({
                title: ayah.reference,
                snippet: ayah.translation,
                category: 'Recitations',
                fullContent: `${ayah.arabic}\n\n${ayah.transliteration}\n\n${ayah.translation}`,
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
                        Verse of the Day
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 1 }}>
                        {ayah.reference}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={save}
                        style={{
                            width: 32, height: 32,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'var(--surface2)', borderRadius: 8,
                            border: '1px solid var(--border)',
                        }}
                    >
                        {isSaved
                            ? <BookMarked size={14} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
                            : <Bookmark size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                        }
                    </button>
                </div>
            </div>

            {/* Arabic */}
            <p
                dir="rtl"
                style={{
                    fontFamily: "'Amiri', Georgia, serif",
                    fontSize: 22,
                    lineHeight: 1.8,
                    color: 'var(--text)',
                    marginBottom: 10,
                    textAlign: 'right',
                }}
            >
                {ayah.arabic}
            </p>

            {/* Translation (always show) */}
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{ayah.translation}"
            </p>

            {/* Expanded: transliteration */}
            <AnimatePresence>
                {expanded && (
                    <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 10, fontStyle: 'italic', lineHeight: 1.6 }}
                    >
                        {ayah.transliteration}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Accent line */}
            <div style={{ height: 2, background: 'var(--accent)', borderRadius: 2, marginTop: 14, width: '40%', opacity: 0.6 }} />
        </motion.div>
    );
};
