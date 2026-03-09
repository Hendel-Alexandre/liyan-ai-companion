import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import type { QuizDifficulty } from '@/services/quizService';

interface Props {
    onStart: (difficulty: QuizDifficulty) => void;
}

const LEVELS: { id: QuizDifficulty; label: string; desc: string; color: string }[] = [
    { id: 'easy', label: 'Easy', desc: '6 Q · Basics', color: 'var(--accent)' },
    { id: 'medium', label: 'Medium', desc: '6 Q · Prayer & Quran', color: '#60A5FA' },
    { id: 'hard', label: 'Hard', desc: '6 Q · Advanced Fiqh', color: '#F472B6' },
];

export const QuizWidget = ({ onStart }: Props) => (
    <div className="card w-full" style={{ padding: '16px' }}>
        <div className="flex items-center gap-3 mb-4">
            <div style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <Trophy size={18} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            </div>
            <div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Knowledge Quiz</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Test Yourself</p>
            </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
            {LEVELS.map(({ id, label, desc, color }) => (
                <motion.button
                    key={id}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => onStart(id)}
                    style={{
                        flex: 1,
                        padding: '12px 8px',
                        background: 'var(--surface2)',
                        border: `1px solid var(--border)`,
                        borderRadius: 12,
                        textAlign: 'center',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{label}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{desc}</p>
                </motion.button>
            ))}
        </div>
    </div>
);
