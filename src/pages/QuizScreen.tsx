import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuizQuestions, type QuizDifficulty, getDifficultyLabel } from '@/services/quizService';
import type { QuizQuestion } from '@/services/types';

interface Props {
    difficulty: QuizDifficulty;
    onBack: () => void;
}

type Phase = 'quiz' | 'result';

const QuizScreen = ({ difficulty, onBack }: Props) => {
    const questions = getQuizQuestions(difficulty);
    const [phase, setPhase] = useState<Phase>('quiz');
    const [index, setIndex] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
    const [revealed, setRevealed] = useState(false);

    const question = questions[index];
    const chosen = answers[index];
    const score = answers.filter((a, i) => a === questions[i].correctIndex).length;

    const choose = (i: number) => {
        if (revealed) return;
        const next = [...answers]; next[index] = i; setAnswers(next);
        setRevealed(true);
    };

    const advance = () => {
        if (index < questions.length - 1) { setIndex(i => i + 1); setRevealed(false); }
        else setPhase('result');
    };

    const restart = () => { setPhase('quiz'); setIndex(0); setAnswers(Array(questions.length).fill(null)); setRevealed(false); };

    const pct = Math.round((score / questions.length) * 100);

    return (
        <div style={{ height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', paddingTop: 'max(1rem, env(safe-area-inset-top))', paddingBottom: 'calc(84px + max(0px, env(safe-area-inset-bottom)))' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', height: 52, borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
                <button onClick={onBack} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', borderRadius: 10, border: '1px solid var(--border)' }}>
                    <ArrowLeft size={16} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                </button>
                <div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{getDifficultyLabel(difficulty)} Quiz</p>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Knowledge Test</p>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {phase === 'quiz' ? (
                    <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
                        {/* Progress */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Question {index + 1} of {questions.length}</span>
                                <span style={{ fontSize: 12, color: 'var(--accent)' }}>{score} correct</span>
                            </div>
                            <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2 }}>
                                <motion.div animate={{ width: `${((index) / questions.length) * 100}%` }} style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                            </div>
                        </div>

                        {/* Category badge */}
                        <span style={{ fontSize: 11, color: 'var(--accent)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px' }}>
                            {question.category}
                        </span>

                        {/* Question */}
                        <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginTop: 12, marginBottom: question.subtitle ? 8 : 20 }}>
                            {question.prompt}
                        </p>
                        {question.subtitle && (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>{question.subtitle}</p>
                        )}

                        {/* Choices */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                            {question.choices.map((choice, i) => {
                                const isCorrect = i === question.correctIndex;
                                const isChosen = i === chosen;
                                let bg = 'var(--surface)';
                                let border = 'var(--border)';
                                let color = 'var(--text)';
                                if (revealed) {
                                    if (isCorrect) { bg = 'rgba(74,222,128,0.12)'; border = '#4ADE80'; color = '#4ADE80'; }
                                    else if (isChosen && !isCorrect) { bg = 'rgba(239,68,68,0.10)'; border = '#EF4444'; color = '#EF4444'; }
                                }
                                return (
                                    <motion.button key={i} whileTap={!revealed ? { scale: 0.97 } : {}} onClick={() => choose(i)}
                                        style={{ padding: '14px 16px', background: bg, border: `1px solid ${border}`, borderRadius: 12, textAlign: 'left', color, fontSize: 14, fontWeight: 500, cursor: revealed ? 'default' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {revealed && isCorrect && <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: '#4ADE80', flexShrink: 0 }} />}
                                        {revealed && isChosen && !isCorrect && <XCircle size={16} strokeWidth={1.5} style={{ color: '#EF4444', flexShrink: 0 }} />}
                                        {(!revealed || (!isCorrect && !isChosen)) && (
                                            <span style={{ width: 20, height: 20, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                        )}
                                        {choice}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Explanation */}
                        <AnimatePresence>
                            {revealed && question.explanation && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                    style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 16 }}>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Explanation</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{question.explanation}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Next button */}
                        {revealed && (
                            <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.97 }}
                                onClick={advance}
                                style={{ width: '100%', height: 52, background: 'var(--accent)', color: 'var(--accent-text)', fontSize: 15, fontWeight: 700, borderRadius: 14, border: 'none', cursor: 'pointer', marginBottom: 16 }}>
                                {index < questions.length - 1 ? 'Next Question →' : 'See Results'}
                            </motion.button>
                        )}
                    </motion.div>
                ) : (
                    /* Results */
                    <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ flex: 1, overflowY: 'auto', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                            <span style={{ fontSize: 30, fontWeight: 800, color: 'var(--accent-text)' }}>{pct}%</span>
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
                            {pct >= 80 ? 'Excellent! 🌙' : pct >= 50 ? 'Good effort! ✨' : 'Keep learning 📖'}
                        </h2>
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>
                            {score} out of {questions.length} correct
                        </p>

                        {/* Review answers */}
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                            {questions.map((q, i) => {
                                const correct = answers[i] === q.correctIndex;
                                return (
                                    <div key={q.id} style={{ padding: '12px 14px', background: 'var(--surface)', border: `1px solid ${correct ? '#4ADE8040' : '#EF444440'}`, borderRadius: 12, display: 'flex', gap: 10 }}>
                                        {correct
                                            ? <CheckCircle2 size={16} strokeWidth={1.5} style={{ color: '#4ADE80', flexShrink: 0, marginTop: 2 }} />
                                            : <XCircle size={16} strokeWidth={1.5} style={{ color: '#EF4444', flexShrink: 0, marginTop: 2 }} />
                                        }
                                        <div>
                                            <p style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{q.prompt}</p>
                                            {!correct && <p style={{ fontSize: 12, color: '#4ADE80', marginTop: 4 }}>✓ {q.choices[q.correctIndex]}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                            <button onClick={restart} style={{ flex: 1, height: 50, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Try Again</button>
                            <button onClick={onBack} style={{ flex: 1, height: 50, background: 'var(--accent)', border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 14, fontWeight: 700, color: 'var(--accent-text)' }}>Done</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default QuizScreen;
