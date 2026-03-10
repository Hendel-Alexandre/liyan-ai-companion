import { useState, useRef } from 'react';
import { X, Check, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

/* ══════════════════════════════════════════
   CONSTANTS & DATA
══════════════════════════════════════════ */
const BG_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2014_21_22-Task%20Manager.png';
const PRAYER_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2014_21_41-Task%20Manager.png';
const NATURE_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2016_37_57-Pictures%20-%20File%20Explorer.png';

const getOrInitStreak = (): number => {
    const today = new Date().toDateString();
    try {
        const raw = localStorage.getItem('liyan_streak');
        const data = raw ? JSON.parse(raw) : {};
        if (data.lastDate === today) return data.count as number;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const next = data.lastDate === yesterday ? (data.count || 0) + 1 : 1;
        localStorage.setItem('liyan_streak', JSON.stringify({ lastDate: today, count: next }));
        return next;
    } catch { return 1; }
};

const ALL_QUESTIONS = [
    { q: 'How many daily obligatory prayers are there in Islam?', options: ['3', '4', '5', '6'], correct: 2 },
    { q: 'Which surah is recited in every rakat of prayer?', options: ['Al-Ikhlas', 'Al-Fatiha', 'Al-Baqarah', 'Al-Kahf'], correct: 1 },
    { q: "What does 'Wudu' mean?", options: ['Prayer', 'Fasting', 'Ritual purification', 'Charity'], correct: 2 },
    { q: 'How many rakahs does Fajr prayer have?', options: ['2', '3', '4', '6'], correct: 0 },
    { q: 'What is said when bowing in Ruku?', options: ['Allahu Akbar', 'Subhana Rabbiyal Azeem', "Subhana Rabbiyal A'la", 'Alhamdulillah'], correct: 1 },
    { q: 'Which prayer has 3 fard rakahs?', options: ['Fajr', 'Dhuhr', 'Maghrib', 'Isha'], correct: 2 },
    { q: 'What breaks wudu?', options: ['Eating', 'Sleeping', 'Laughing', 'Walking'], correct: 1 },
    { q: 'How many times is "Allahu Akbar" said in the Adhan?', options: ['4', '6', '8', '2'], correct: 1 },
];

const DAILY_SEED = Math.floor(Date.now() / 86400000);
const getTodayQuestions = () =>
    Array.from({ length: 5 }, (_, i) => ALL_QUESTIONS[(DAILY_SEED + i) % ALL_QUESTIONS.length]);

const PRAYER_STEPS = [
    { number: 1, title: 'Intention (Niyyah)', description: 'Make a sincere intention in your heart to perform the prayer for the sake of Allah.' },
    { number: 2, title: 'Takbeer al-Ihraam', arabic: 'ٱللَّٰهُ أَكۡبَرُ', transliteration: 'Allahu Akbar', description: 'Raise both hands to ear level and say "Allahu Akbar" to begin.' },
    { number: 3, title: 'Opening Dua', arabic: 'سُبۡحَانَكَ ٱللَّهُمَّ وَبِحَمۡدِكَ', transliteration: 'Subhânaka Allâhumma wabihamdik', description: 'Quietly recite the opening supplication after the takbeer.' },
    { number: 4, title: 'Recite Al-Fatiha', description: 'Recite Surah Al-Fatiha — obligatory in every rakat.' },
    { number: 5, title: "Rukoo' (Bowing)", arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡعَظِيمِ', transliteration: 'Subhana Rabbiyal Azeem', description: 'Bow with back straight, hands on knees, saying this three times.' },
    { number: 6, title: 'Rise from Rukoo', arabic: 'سَمِعَ ٱللَّهُ لِمَنۡ حَمِدَهُ', transliteration: "Sami' Allahu liman hamida", description: 'Rise saying this, then stand upright momentarily.' },
    { number: 7, title: 'Sujood (Prostration)', arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡأَعۡلَىٰ', transliteration: "Subhana Rabbiyal A'la", description: 'Prostrate with 7 body parts on the ground, saying this three times.' },
    { number: 8, title: 'Tashahhud & Salaam', description: "Sit, recite At-Tashahhud, then Salawat on the Prophet ﷺ. End with Salaam to both sides." },
];

const WUDU_STEPS: { number: number; title: string; arabic?: string; transliteration?: string; description: string }[] = [
    { number: 1, title: 'Intention', description: 'Form the intention to purify yourself for prayer.' },
    { number: 2, title: 'Bismillah', arabic: 'بِسۡمِ ٱللَّهِ', transliteration: 'Bismillāh', description: 'Begin with "Bismillah" as a blessed beginning.' },
    { number: 3, title: 'Wash Both Hands', description: 'Wash each hand up to and including the wrist, three times.' },
    { number: 4, title: 'Rinse the Mouth', description: 'Rinse the mouth thoroughly three times.' },
    { number: 5, title: 'Inhale & Blow Nose', description: 'Inhale water into the nose and blow it out, three times.' },
    { number: 6, title: 'Wash the Face', description: 'Wash from hairline to chin, ear to ear, three times.' },
    { number: 7, title: 'Wash Both Arms', description: 'Wash each arm from fingertips to elbow, three times.' },
    { number: 8, title: 'Wipe the Head', description: 'Wipe the entire head once with wet hands, front to back.' },
    { number: 9, title: 'Wipe the Ears', description: 'Wipe inside and behind both ears once.' },
    { number: 10, title: 'Wash Both Feet', description: 'Wash each foot including the ankles, three times.' },
];

const PHRASES = [
    { arabic: 'ٱللَّٰهُ أَكۡبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', when: 'All transitions' },
    { arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡعَظِيمِ', transliteration: 'Subhana Rabbiyal Azeem', translation: 'Glory to my Lord, the Magnificent', when: "In Rukoo'" },
    { arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡأَعۡلَىٰ', transliteration: "Subhana Rabbiyal A'la", translation: 'Glory to my Lord, the Most High', when: 'In Sujood' },
    { arabic: 'ٱلسَّلَامُ عَلَيۡكُمۡ وَرَحۡمَةُ ٱللَّهِ', transliteration: 'Assalamu Alaykum wa Rahmatullah', translation: 'Peace and mercy of Allah be upon you', when: 'Ending prayer' },
];

const RAKAHS = [
    { name: 'Fajr', fard: 2, sunnah: '2 before', color: '#4A9EFF', time: 'Dawn' },
    { name: 'Dhuhr', fard: 4, sunnah: '4 before · 2 after', color: '#FFB840', time: 'Midday' },
    { name: 'Asr', fard: 4, sunnah: '4 before', color: '#FF8C42', time: 'Afternoon' },
    { name: 'Maghrib', fard: 3, sunnah: '2 after', color: '#C084FC', time: 'Sunset' },
    { name: 'Isha', fard: 4, sunnah: '4 before · 2 after · 3 Witr', color: '#6366F1', time: 'Night' },
];

const NAMES = [
    { n: 1, arabic: 'الرَّحْمَٰنُ', latin: 'Ar-Rahman', en: 'The Most Gracious' },
    { n: 2, arabic: 'الرَّحِيمُ', latin: 'Ar-Raheem', en: 'The Most Merciful' },
    { n: 3, arabic: 'الْمَلِكُ', latin: 'Al-Malik', en: 'The King' },
    { n: 4, arabic: 'الْقُدُّوسُ', latin: 'Al-Quddus', en: 'The Holy' },
    { n: 5, arabic: 'السَّلَامُ', latin: 'As-Salam', en: 'Source of Peace' },
    { n: 6, arabic: 'الْمُؤْمِنُ', latin: "Al-Mu'min", en: 'Guardian of Faith' },
    { n: 7, arabic: 'الْعَزِيزُ', latin: 'Al-Aziz', en: 'The Almighty' },
    { n: 8, arabic: 'الْغَفَّارُ', latin: 'Al-Ghaffar', en: 'The All-Forgiving' },
];

const FACTS = [
    { emoji: '🕌', tag: 'DID YOU KNOW', text: 'The Adhan is heard somewhere on Earth every second due to different time zones across the world.' },
    { emoji: '📿', tag: 'HISTORY', text: "The Quran was revealed over 23 years. The first word revealed was 'Iqra' — emphasizing the importance of knowledge." },
    { emoji: '🤲', tag: 'WORSHIP', text: 'A Muslim who prays all 5 daily prayers performs sujood at least 34 times every single day.' },
];

/* ══════════════════════════════════════════
   BOTTOM SHEET
══════════════════════════════════════════ */
const BottomSheet = ({ open, onClose, title, children }: {
    open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) => (
    <AnimatePresence>
        {open && (
            <>
                <motion.div
                    key="bd"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={onClose}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 80 }}
                />
                <motion.div
                    key="sh"
                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 32 }}
                    style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxHeight: '88dvh', background: '#FFFFFF', borderRadius: '22px 22px 0 0', border: '1px solid var(--border)', borderBottom: 'none', overflowY: 'auto', zIndex: 81, paddingBottom: 'calc(28px + env(safe-area-inset-bottom))' }}
                >
                    <div style={{ width: 36, height: 4, background: 'rgba(0,0,0,0.1)', borderRadius: 2, margin: '12px auto 0' }} />
                    <div style={{ position: 'sticky', top: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px 13px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', zIndex: 1 }}>
                        <p style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.025em' }}>{title}</p>
                        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <X size={14} strokeWidth={2} style={{ color: 'var(--text-muted)' }} />
                        </button>
                    </div>
                    <div style={{ padding: '14px 16px' }}>{children}</div>
                </motion.div>
            </>
        )}
    </AnimatePresence>
);

/* ══════════════════════════════════════════
   STEP CARD
══════════════════════════════════════════ */
const StepCard = ({ number, title, arabic, transliteration, description, checked, onCheck }: {
    number: number; title: string; arabic?: string; transliteration?: string;
    description: string; checked: boolean; onCheck: () => void;
}) => (
    <motion.div
        layout whileTap={{ scale: 0.985 }} onClick={onCheck}
        style={{ display: 'flex', gap: 11, padding: '12px 13px', background: checked ? 'rgba(var(--accent-rgb),0.06)' : 'var(--surface)', border: `1px solid ${checked ? 'rgba(var(--accent-rgb),0.22)' : 'var(--border)'}`, borderRadius: 14, cursor: 'pointer', transition: 'background 0.2s, border 0.2s' }}
    >
        <motion.div
            animate={{ background: checked ? 'var(--accent)' : 'var(--surface2)' }}
            style={{ width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${checked ? 'var(--accent)' : 'var(--border-strong)'}`, transition: 'all 0.2s' }}
        >
            <AnimatePresence mode="wait">
                {checked
                    ? <motion.div key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={12} strokeWidth={2.5} style={{ color: 'var(--accent-text)' }} /></motion.div>
                    : <motion.span key="n" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{number}</motion.span>
                }
            </AnimatePresence>
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: checked ? 'var(--text-muted)' : 'var(--text)', textDecoration: checked ? 'line-through' : 'none', marginBottom: arabic && !checked ? 5 : 3, transition: 'color 0.2s' }}>{title}</p>
            {arabic && !checked && <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 17, color: 'var(--text)', lineHeight: 1.7, textAlign: 'right', marginBottom: 3 }}>{arabic}</p>}
            {transliteration && !checked && <p style={{ fontSize: 11, color: 'var(--accent)', fontStyle: 'italic', marginBottom: 3 }}>{transliteration}</p>}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{description}</p>
        </div>
    </motion.div>
);

const ChecklistModal = ({ steps, prefix }: { steps: typeof PRAYER_STEPS; prefix: string }) => {
    const [checked, setChecked] = useState<Set<string>>(new Set());
    const toggle = (k: string) => setChecked(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; });
    const done = steps.filter(s => checked.has(`${prefix}-${s.number}`)).length;
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {/* Progress */}
            <div style={{ padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>Progress</span>
                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>{done}/{steps.length}</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                    <motion.div animate={{ width: `${(done / steps.length) * 100}%` }} transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={{ height: '100%', background: 'var(--accent)', borderRadius: 2 }} />
                </div>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>Tap each step to mark complete</p>
            </div>
            {steps.map(step => (
                <StepCard key={step.number} {...step} checked={checked.has(`${prefix}-${step.number}`)} onCheck={() => toggle(`${prefix}-${step.number}`)} />
            ))}
            {done === steps.length && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    style={{ padding: 16, textAlign: 'center', background: 'rgba(var(--accent-rgb),0.08)', border: '1px solid rgba(var(--accent-rgb),0.25)', borderRadius: 16, marginTop: 4 }}>
                    <p style={{ fontSize: 24 }}>🤲</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginTop: 5 }}>Masha'Allah!</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>May Allah accept it.</p>
                </motion.div>
            )}
        </div>
    );
};

/* ══════════════════════════════════════════
   QUIZ — with Start Gate
══════════════════════════════════════════ */
type QuizPhase = 'idle' | 'active' | 'done';

const DailyQuiz = () => {
    const questions = getTodayQuestions();
    const [phase, setPhase] = useState<QuizPhase>('idle');
    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [shake, setShake] = useState(false);

    const current = questions[idx];
    const answered = answers[idx] !== undefined;
    const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);

    const pick = (opt: number) => {
        if (answered) return;
        setAnswers(prev => ({ ...prev, [idx]: opt }));
        if (opt !== current.correct) { setShake(true); setTimeout(() => setShake(false), 500); }
    };

    const next = () => {
        if (idx < questions.length - 1) setIdx(i => i + 1);
        else setPhase('done');
    };

    const reset = () => { setPhase('idle'); setIdx(0); setAnswers({}); };

    const scoreMsg = score === 5 ? "Perfect! Masha'Allah 🌟" : score >= 3 ? "Great effort! Keep learning 📚" : "Keep practicing 💪";

    /* ── IDLE: Start card ── */
    if (phase === 'idle') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ borderRadius: 18, overflow: 'hidden', position: 'relative' }}
            >
                {/* BG image */}
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${NATURE_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.82) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 110%, rgba(var(--accent-rgb),0.25) 0%, transparent 65%)' }} />

                <div style={{ position: 'relative', padding: '20px 18px' }}>
                    {/* Tag */}
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.15)', border: '1px solid rgba(var(--accent-rgb),0.3)', borderRadius: 6, padding: '3px 8px' }}>
                        DAILY QUIZ
                    </span>

                    <p style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 10, marginBottom: 4, letterSpacing: '-0.025em', lineHeight: 1.25 }}>
                        Test Your<br />Islamic Knowledge
                    </p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 16 }}>
                        5 questions · Updates daily
                    </p>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
                        {['5 Questions', 'Islamic Basics', 'Daily Fresh'].map((label, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '5px 10px' }}>
                                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Start button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPhase('active')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, height: 42, background: 'var(--accent)', color: 'var(--accent-text)', borderRadius: 12, padding: '0 18px', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer' }}
                    >
                        <Play size={15} strokeWidth={2.5} style={{ fill: 'var(--accent-text)', color: 'var(--accent-text)' }} />
                        Start Quiz
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    /* ── DONE: Score card ── */
    if (phase === 'done') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                style={{ borderRadius: 18, overflow: 'hidden', position: 'relative' }}
            >
                <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${NATURE_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 100%, rgba(var(--accent-rgb),0.3) 0%, transparent 60%)' }} />
                <div style={{ position: 'relative', padding: '24px 18px', textAlign: 'center' }}>
                    <p style={{ fontSize: 32, marginBottom: 10 }}>🎉</p>
                    <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.02em' }}>Quiz Complete!</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 6 }}>
                        <span style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{score}</span>
                        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>/ {questions.length}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20 }}>{scoreMsg}</p>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                        style={{ height: 38, background: 'transparent', border: '1.5px solid var(--accent)', borderRadius: 10, padding: '0 22px', fontSize: 13, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }}>
                        Try Again
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    /* ── ACTIVE: Questions ── */
    return (
        <motion.div
            animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : {}}
            transition={{ duration: 0.45 }}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, overflow: 'hidden' }}
        >
            {/* Header bar */}
            <div style={{
                padding: '12px 14px',
                background: 'var(--surface2)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                    {idx + 1} <span style={{ color: 'var(--border-strong)' }}>/</span> {questions.length}
                </span>

                {/* Progress dots */}
                <div style={{ display: 'flex', gap: 5 }}>
                    {questions.map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                width: i === idx ? 20 : 7,
                                background: answers[i] !== undefined
                                    ? (answers[i] === questions[i].correct ? '#4ADE80' : '#EF4444')
                                    : i === idx ? 'var(--accent)' : 'var(--surface2)',
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            style={{ height: 7, borderRadius: 4, border: `1px solid ${i <= idx ? 'rgba(255,255,255,0.1)' : 'var(--border)'}` }}
                        />
                    ))}
                </div>

                {/* Score so far */}
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
                    {score} ✓
                </span>
            </div>

            {/* Question */}
            <div style={{ padding: '16px 14px 12px' }}>
                <AnimatePresence mode="wait">
                    <motion.p
                        key={idx}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.18 }}
                        style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4, marginBottom: 14, letterSpacing: '-0.02em' }}
                    >
                        {current.q}
                    </motion.p>
                </AnimatePresence>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {current.options.map((opt, i) => {
                        const isSelected = answers[idx] === i;
                        const isRight = i === current.correct;
                        const showResult = answered;
                        let bg = 'var(--bg)';
                        let border = '1px solid var(--border)';
                        let textColor = 'var(--text)';
                        let rightEl = null;
                        if (showResult && isRight) {
                            bg = 'rgba(74,222,128,0.12)';
                            border = '1px solid rgba(74,222,128,0.35)';
                            textColor = '#4ADE80';
                            rightEl = <Check size={15} strokeWidth={2.5} style={{ color: '#4ADE80', flexShrink: 0 }} />;
                        } else if (showResult && isSelected && !isRight) {
                            bg = 'rgba(239,68,68,0.1)';
                            border = '1px solid rgba(239,68,68,0.3)';
                            textColor = '#EF4444';
                            rightEl = <X size={15} strokeWidth={2.5} style={{ color: '#EF4444', flexShrink: 0 }} />;
                        }
                        return (
                            <motion.button
                                key={i} whileTap={!answered ? { scale: 0.98 } : {}} onClick={() => pick(i)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, background: bg, border, borderRadius: 11, padding: '10px 13px', fontSize: 14, color: textColor, textAlign: 'left', cursor: answered ? 'default' : 'pointer', fontWeight: isSelected || (showResult && isRight) ? 600 : 400, transition: 'all 0.18s', gap: 8 }}
                            >
                                <span style={{ flex: 1, lineHeight: 1.35 }}>{opt}</span>
                                {rightEl}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Next button */}
                <AnimatePresence>
                    {answered && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ marginTop: 12 }}>
                            <button onClick={next}
                                style={{ width: '100%', height: 40, background: 'var(--accent)', color: 'var(--accent-text)', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '-0.01em' }}>
                                {idx < questions.length - 1 ? 'Next Question →' : 'See Results →'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

/* ══════════════════════════════════════════
   SWIPEABLE FACTS CAROUSEL
══════════════════════════════════════════ */
const FactsCarousel = () => {
    const [idx, setIdx] = useState(0);
    const [dir, setDir] = useState(0);

    const go = (d: number) => {
        const next = idx + d;
        if (next < 0 || next >= FACTS.length) return;
        setDir(d);
        setIdx(next);
    };

    const handleDrag = (_: any, info: PanInfo) => {
        if (info.offset.x < -50) go(1);
        else if (info.offset.x > 50) go(-1);
    };

    const variants = {
        enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
        center: { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 340, damping: 30 } },
        exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, transition: { duration: 0.15 } }),
    };

    const f = FACTS[idx];

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', marginBottom: 10 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Did You Know?</p>
                <div style={{ display: 'flex', gap: 4 }}>
                    {FACTS.map((_, i) => (
                        <motion.button key={i} onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i); }}
                            animate={{ width: i === idx ? 16 : 5, background: i === idx ? 'var(--accent)' : 'var(--surface2)' }}
                            style={{ height: 5, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0 }}
                        />
                    ))}
                </div>
            </div>

            <div style={{ padding: '0 16px', position: 'relative', height: 110 }}>
                <div style={{ position: 'absolute', inset: '0 16px', borderRadius: 16, overflow: 'hidden' }}>
                    <AnimatePresence initial={false} custom={dir} mode="popLayout">
                        <motion.div
                            key={idx} custom={dir} variants={variants} initial="enter" animate="center" exit="exit"
                            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={handleDrag}
                            style={{ position: 'absolute', inset: 0, cursor: 'grab', padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}
                            whileTap={{ cursor: 'grabbing' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                                <span style={{ fontSize: 16 }}>{f.emoji}</span>
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)' }}>{f.tag}</span>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {f.text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

/* ══════════════════════════════════════════
   LEARN SCREEN
══════════════════════════════════════════ */
type ModalType = 'pray' | 'wudu' | 'phrases' | 'times' | 'names' | null;


const LearnScreen = () => {
    const streak = useRef(getOrInitStreak()).current;
    const [modal, setModal] = useState<ModalType>(null);
    const [expandedPhrase, setPhrase] = useState<number | null>(null);
    const [expandedName, setName] = useState<number | null>(null);

    const openModal = (id: ModalType) => {
        setModal(id);
    };

    return (
        <div style={{
            height: '100dvh', background: 'var(--bg)',
            overflowY: 'auto', WebkitOverflowScrolling: 'touch',
            paddingTop: 'max(1rem, env(safe-area-inset-top))',
            paddingBottom: 'calc(80px + max(0px, env(safe-area-inset-bottom)))',
        }}>

            {/* ══ HEADER ══ */}
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                style={{ padding: '0 18px 12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>AL-ILIM</p>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>Learn</h1>
                </div>
                <div style={{ background: 'rgba(var(--accent-rgb),0.1)', border: '1px solid rgba(var(--accent-rgb),0.22)', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span>🔥</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>{streak} day</span>
                </div>
            </motion.div>

            {/* ══ FEATURED BANNER ══ */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                style={{ padding: '0 16px 16px' }}>
                <div style={{ height: 120, borderRadius: 18, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${PRAYER_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.78) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 85% 110%, rgba(var(--accent-rgb),0.22) 0%, transparent 60%)' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 16px', justifyContent: 'space-between' }}>
                        <div>
                            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.18)', border: '1px solid rgba(var(--accent-rgb),0.3)', borderRadius: 5, padding: '2px 7px' }}>FEATURED</span>
                            <p style={{ fontSize: 19, fontWeight: 700, color: '#fff', margin: '6px 0 3px', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Master Your<br />Prayer</p>
                            <motion.button whileTap={{ scale: 0.95 }} onClick={() => openModal('pray')}
                                style={{ height: 28, background: 'var(--accent)', color: 'var(--accent-text)', borderRadius: 8, padding: '0 12px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', marginTop: 6 }}>
                                Start Now →
                            </motion.button>
                        </div>
                        <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 40, color: 'rgba(255,255,255,0.82)', lineHeight: 1, paddingRight: 4 }}>صَلَاة</p>
                    </div>
                </div>
            </motion.div>

            {/* ══ DAILY QUIZ ══ */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                style={{ padding: '0 16px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Daily Quiz</p>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Updates daily</span>
                </div>
                <DailyQuiz />
            </motion.div>

            {/* ══ FACTS CAROUSEL ══ */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ paddingBottom: 16 }}>
                <FactsCarousel />
            </motion.div>

            {/* ══ 99 NAMES ══ */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                style={{ paddingBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 18px', marginBottom: 10 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Names of Allah</p>
                    <motion.button whileTap={{ scale: 0.95 }} onClick={() => openModal('names')}
                        style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                        View all →
                    </motion.button>
                </div>
                <div style={{ display: 'flex', overflowX: 'auto', padding: '0 16px', gap: 8, scrollbarWidth: 'none' }}>
                    {NAMES.map(name => (
                        <div key={name.n} style={{ flexShrink: 0, width: 76, height: 84, borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', padding: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                            <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 16, color: 'var(--text)', lineHeight: 1.4, textAlign: 'center' }}>{name.arabic}</p>
                            <p style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 600 }}>#{name.n}</p>
                            <p style={{ fontSize: 9, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.3 }}>{name.en}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ══ MODALS ══ */}
            <BottomSheet open={modal === 'pray'} onClose={() => setModal(null)} title="How to Pray">
                <ChecklistModal steps={PRAYER_STEPS} prefix="pray" />
            </BottomSheet>

            <BottomSheet open={modal === 'wudu'} onClose={() => setModal(null)} title="Wudu Guide">
                <ChecklistModal steps={WUDU_STEPS} prefix="wudu" />
            </BottomSheet>

            <BottomSheet open={modal === 'phrases'} onClose={() => setModal(null)} title="Prayer Phrases">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {PHRASES.map((p, i) => (
                        <motion.div key={i} layout onClick={() => setPhrase(expandedPhrase === i ? null : i)} whileTap={{ scale: 0.985 }}
                            style={{ padding: '12px 13px', background: expandedPhrase === i ? 'rgba(var(--accent-rgb),0.06)' : 'var(--surface)', border: `1px solid ${expandedPhrase === i ? 'rgba(var(--accent-rgb),0.22)' : 'var(--border)'}`, borderRadius: 13, cursor: 'pointer', transition: 'all 0.18s' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.12)', border: '1px solid rgba(var(--accent-rgb),0.22)', borderRadius: 5, padding: '2px 7px' }}>{p.when}</span>
                                <motion.div animate={{ rotate: expandedPhrase === i ? 90 : 0 }}>
                                    <ChevronRight size={13} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                                </motion.div>
                            </div>
                            <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 19, color: 'var(--text)', lineHeight: 1.7, textAlign: 'right' }}>{p.arabic}</p>
                            <AnimatePresence>
                                {expandedPhrase === i && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                                        <div style={{ paddingTop: 9, borderTop: '1px solid var(--border)', marginTop: 9 }}>
                                            <p style={{ fontSize: 11, color: 'var(--accent)', fontStyle: 'italic', marginBottom: 3 }}>{p.transliteration}</p>
                                            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.translation}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </BottomSheet>

            <BottomSheet open={modal === 'times'} onClose={() => setModal(null)} title="Prayer Rakahs">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ padding: '12px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 4 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>Fard Rakahs</p>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 56, justifyContent: 'space-around' }}>
                            {RAKAHS.map((p, i) => (
                                <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{p.fard}</span>
                                    <motion.div initial={{ height: 0 }} animate={{ height: (p.fard / 4) * 40 }} transition={{ type: 'spring', stiffness: 200, damping: 22, delay: i * 0.07 }}
                                        style={{ width: 24, background: p.color, borderRadius: '5px 5px 3px 3px', opacity: 0.85 }} />
                                    <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500 }}>{p.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {RAKAHS.map((p, i) => (
                        <motion.div key={p.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 13 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</p>
                                    <span style={{ fontSize: 9, color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px' }}>{p.time}</span>
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sunnah}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 3 }}>
                                {Array.from({ length: p.fard }).map((_, j) => (
                                    <div key={j} style={{ width: 7, height: 7, borderRadius: 2, background: p.color }} />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </BottomSheet>

            <BottomSheet open={modal === 'names'} onClose={() => setModal(null)} title="Names of Allah">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                    {NAMES.map((name, i) => (
                        <motion.div key={name.n} layout onClick={() => setName(expandedName === i ? null : i)} whileTap={{ scale: 0.97 }}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            style={{ padding: '11px 9px', background: expandedName === i ? 'rgba(var(--accent-rgb),0.06)' : 'var(--surface)', border: `1px solid ${expandedName === i ? 'rgba(var(--accent-rgb),0.22)' : 'var(--border)'}`, borderRadius: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', transition: 'all 0.18s' }}>
                            <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 17, color: 'var(--text)', lineHeight: 1.4 }}>{name.arabic}</p>
                            <p style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 600 }}>#{name.n}</p>
                            <p style={{ fontSize: 9, color: 'var(--text-soft)', textAlign: 'center', lineHeight: 1.3 }}>{name.en}</p>
                            <AnimatePresence>
                                {expandedName === i && (
                                    <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        style={{ fontSize: 9, color: 'var(--accent)', fontStyle: 'italic', textAlign: 'center', overflow: 'hidden' }}>
                                        {name.latin}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </BottomSheet>

        </div>
    );
};

export default LearnScreen;