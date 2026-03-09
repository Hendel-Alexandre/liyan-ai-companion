import { useState, useEffect } from 'react';
import { Moon, Droplets, BookOpen, Hash, ChevronRight, Check, MapPin, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { fetchPrayerTimesAuto, fetchPrayerTimesByCity, cleanTime, getNextPrayer } from '@/services/prayerService';
import type { PrayerTimesResult } from '@/services/prayerService';

/* ══════════════════════════════════════
   DATA
══════════════════════════════════════ */
const PRAYER_STEPS = [
  { number: 1, title: 'Intention (Niyyah)', description: 'Make a sincere intention in your heart to perform the prayer for the sake of Allah.' },
  { number: 2, title: 'Takbeer al-Ihraam', arabic: 'ٱللَّٰهُ أَكۡبَرُ', transliteration: 'Allahu Akbar', description: 'Raise both hands to ear level and say "Allahu Akbar" to begin the prayer.' },
  { number: 3, title: 'Opening Dua', arabic: 'سُبۡحَانَكَ ٱللَّهُمَّ وَبِحَمۡدِكَ', transliteration: 'Subhânaka Allâhumma wabihamdik', description: 'Quietly recite the opening supplication after the initial takbeer.' },
  { number: 4, title: 'Recite Al-Fatiha', description: 'Recite Surah Al-Fatiha — obligatory in every rakat. Follow with another surah or a few ayahs.' },
  { number: 5, title: "Rukoo' (Bowing)", arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡعَظِيمِ', transliteration: 'Subhana Rabbiyal Azeem', description: 'Bow with your back straight, hands on knees, saying this three times.' },
  { number: 6, title: 'Rise from Rukoo', arabic: 'سَمِعَ ٱللَّهُ لِمَنۡ حَمِدَهُ', transliteration: "Sami' Allahu liman hamida", description: 'Rise saying "Sami Allah liman hamida" then stand upright momentarily.' },
  { number: 7, title: 'Sujood (Prostration)', arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡأَعۡلَىٰ', transliteration: "Subhana Rabbiyal A'la", description: "Prostrate with 7 body parts on the ground, saying this three times." },
  { number: 8, title: 'Tashahhud & Salaam', description: "In the final rakat, sit and recite At-Tashahhud, then Salawat on the Prophet ﷺ. End with Salaam to both sides." },
];

const WUDU_STEPS = [
  { number: 1, title: 'Intention', description: 'Form the intention to purify yourself for prayer.' },
  { number: 2, title: 'Bismillah', arabic: 'بِسۡمِ ٱللَّهِ', description: 'Begin with "Bismillah" as a blessed beginning.' },
  { number: 3, title: 'Wash Both Hands', description: 'Wash each hand up to and including the wrist, three times.' },
  { number: 4, title: 'Rinse the Mouth', description: 'Rinse the mouth thoroughly three times.' },
  { number: 5, title: 'Inhale & Blow Nose', description: 'Inhale water into the nose and blow it out, three times.' },
  { number: 6, title: 'Wash the Face', description: 'Wash the entire face from hairline to chin, ear to ear, three times.' },
  { number: 7, title: 'Wash Both Arms', description: 'Wash each arm from fingertips to elbow, three times.' },
  { number: 8, title: 'Wipe the Head', description: 'Wipe the entire head once with wet hands, front to back and back to front.' },
  { number: 9, title: 'Wipe the Ears', description: 'Wipe inside and behind both ears once with wet fingers.' },
  { number: 10, title: 'Wash Both Feet', description: 'Wash each foot including the ankles, three times.' },
];

const PHRASES = [
  { arabic: 'ٱللَّٰهُ أَكۡبَرُ', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', when: 'Transitions between positions' },
  { arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡعَظِيمِ', transliteration: 'Subhana Rabbiyal Azeem', translation: 'Glory be to my Lord, the Magnificent', when: "In Rukoo'" },
  { arabic: 'سُبۡحَانَ رَبِّيَ ٱلۡأَعۡلَىٰ', transliteration: "Subhana Rabbiyal A'la", translation: 'Glory be to my Lord, the Most High', when: 'In Sujood' },
  { arabic: 'ٱلسَّلَامُ عَلَيۡكُمۡ وَرَحۡمَةُ ٱللَّهِ', transliteration: 'Assalamu Alaykum wa Rahmatullah', translation: 'Peace and mercy of Allah be upon you', when: 'Ends the prayer (both sides)' },
];

const RAKAHS = [
  { name: 'Fajr', fard: 2, sunnah: '2 Sunnah before', color: '#4A9EFF', time: 'Dawn' },
  { name: 'Dhuhr', fard: 4, sunnah: '4 before · 2 after', color: '#FFB840', time: 'Midday' },
  { name: 'Asr', fard: 4, sunnah: '4 Sunnah before', color: '#FF8C42', time: 'Afternoon' },
  { name: 'Maghrib', fard: 3, sunnah: '2 Sunnah after', color: '#C084FC', time: 'Sunset' },
  { name: 'Isha', fard: 4, sunnah: '4 before · 2 after · 3 Witr', color: '#6366F1', time: 'Night' },
];

const TABS = [
  { id: 'pray', label: 'How to Pray', Icon: Moon, count: PRAYER_STEPS.length },
  { id: 'wudu', label: 'Wudu', Icon: Droplets, count: WUDU_STEPS.length },
  { id: 'phrases', label: 'Phrases', Icon: BookOpen, count: PHRASES.length },
  { id: 'rakahs', label: 'Rakahs', Icon: Hash, count: RAKAHS.length },
] as const;

type TabId = typeof TABS[number]['id'];

/* ══════════════════════════════════════
   STEP CARD (interactive checklist)
══════════════════════════════════════ */
const StepCard = ({
  number, title, arabic, transliteration, description, checked, onCheck, accent,
}: {
  number: number; title: string; arabic?: string; transliteration?: string;
  description: string; checked: boolean; onCheck: () => void; accent?: string;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: number * 0.04, type: 'spring', stiffness: 300, damping: 28 }}
    style={{
      display: 'flex', gap: 12, padding: '14px 14px',
      background: checked ? 'rgba(var(--accent-rgb),0.06)' : 'var(--surface)',
      border: `1px solid ${checked ? 'rgba(var(--accent-rgb),0.25)' : 'var(--border)'}`,
      borderRadius: 16,
      transition: 'background 0.2s, border-color 0.2s',
      cursor: 'pointer',
    }}
    onClick={onCheck}
    whileTap={{ scale: 0.985 }}
  >
    {/* Step number / check */}
    <motion.div
      animate={{
        background: checked ? 'var(--accent)' : 'var(--surface2)',
        borderColor: checked ? 'var(--accent)' : 'var(--border-strong)',
      }}
      style={{
        width: 30, height: 30, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, border: '1.5px solid',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <AnimatePresence mode="wait">
        {checked ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={14} strokeWidth={2.5} style={{ color: 'var(--accent-text)' }} />
          </motion.div>
        ) : (
          <motion.span key="num" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
            {number}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>

    {/* Content */}
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 14, fontWeight: 600,
        color: checked ? 'var(--text-muted)' : 'var(--text)',
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'color 0.2s',
        marginBottom: arabic ? 6 : 4,
      }}>
        {title}
      </p>
      {arabic && !checked && (
        <p dir="rtl" style={{
          fontFamily: "'Amiri', serif", fontSize: 20,
          color: 'var(--text)', lineHeight: 1.75, textAlign: 'right', marginBottom: 4,
        }}>
          {arabic}
        </p>
      )}
      {transliteration && !checked && (
        <p style={{ fontSize: 12, color: 'var(--accent)', fontStyle: 'italic', marginBottom: 5 }}>
          {transliteration}
        </p>
      )}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
        {description}
      </p>
    </div>
  </motion.div>
);

/* ══════════════════════════════════════
   PRAYER SCREEN
══════════════════════════════════════ */
const PrayerScreen = () => {
  const [activeTab, setActiveTab] = useState<TabId>('pray');
  const [tabDir, setTabDir] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedPhrase, setExpandedPhrase] = useState<number | null>(null);

  // Prayer times state
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesResult | null>(null);
  const [ptLoading, setPtLoading] = useState(true);
  const [ptError, setPtError] = useState<string | null>(null);
  const [cityInput, setCityInput] = useState('');
  const [showCityInput, setShowCityInput] = useState(false);

  useEffect(() => {
    fetchPrayerTimesAuto()
      .then(r => { setPrayerTimes(r); setPtLoading(false); })
      .catch(() => { setPtError('Could not fetch prayer times'); setPtLoading(false); });
  }, []);

  const fetchByCity = () => {
    if (!cityInput.trim()) return;
    setPtLoading(true);
    setPtError(null);
    const [city, country = 'US'] = cityInput.split(',').map(s => s.trim());
    fetchPrayerTimesByCity(city, country)
      .then(r => { setPrayerTimes(r); setPtLoading(false); setShowCityInput(false); })
      .catch(() => { setPtError('City not found'); setPtLoading(false); });
  };

  const tabIndex = TABS.findIndex(t => t.id === activeTab);

  const switchTab = (id: TabId) => {
    const newIndex = TABS.findIndex(t => t.id === id);
    setTabDir(newIndex > tabIndex ? 1 : -1);
    setActiveTab(id);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -60 && tabIndex < TABS.length - 1) switchTab(TABS[tabIndex + 1].id);
    else if (info.offset.x > 60 && tabIndex > 0) switchTab(TABS[tabIndex - 1].id);
  };

  const toggle = (key: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const prayChecked = PRAYER_STEPS.filter(s => checked.has(`pray-${s.number}`)).length;
  const wuduChecked = WUDU_STEPS.filter(s => checked.has(`wudu-${s.number}`)).length;

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 260 : -260, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { type: 'spring' as const, stiffness: 320, damping: 30 } },
    exit: (dir: number) => ({ x: dir > 0 ? -260 : 260, opacity: 0, transition: { duration: 0.16 } }),
  };

  return (
    <div style={{
      height: '100dvh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      paddingTop: 'max(1rem, env(safe-area-inset-top))',
      paddingBottom: 'calc(76px + max(0px, env(safe-area-inset-bottom)))',
      overflow: 'hidden',
    }}>

      {/* ── HEADER + PRAYER TIMES ── */}
      <div style={{ padding: '0 16px 10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Guides</p>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>Prayer</h1>
          </div>
          <button onClick={() => setShowCityInput(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 10px', cursor: 'pointer' }}>
            <MapPin size={12} strokeWidth={1.5} />
            {prayerTimes?.location || 'Set location'}
          </button>
        </div>

        {/* City input */}
        {showCityInput && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              value={cityInput} onChange={e => setCityInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchByCity()}
              placeholder="City, Country (e.g. London, GB)"
              style={{ flex: 1, fontSize: 13, background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border-strong)', borderRadius: 10, padding: '8px 12px', outline: 'none' }}
            />
            <button onClick={fetchByCity}
              style={{ background: 'var(--accent)', color: 'var(--accent-text)', border: 'none', borderRadius: 10, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Go
            </button>
          </div>
        )}

        {/* Prayer times widget */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
          {ptLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 56, gap: 8 }}>
              <RefreshCw size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fetching prayer times…</span>
            </div>
          ) : ptError ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 44 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ptError}</span>
            </div>
          ) : prayerTimes ? (
            <div>
              {/* Hijri date */}
              <div style={{ padding: '8px 14px 6px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {prayerTimes.hijri.day} {prayerTimes.hijri.month.en} {prayerTimes.hijri.year} AH
                </span>
                {(() => {
                  const next = getNextPrayer(prayerTimes.timings);
                  return (
                    <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                      {next.name} in {next.minsUntil < 60 ? `${next.minsUntil}m` : `${Math.floor(next.minsUntil / 60)}h ${next.minsUntil % 60}m`}
                    </span>
                  );
                })()}
              </div>
              {/* Times row */}
              <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 8px 10px' }}>
                {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(name => {
                  const next = getNextPrayer(prayerTimes.timings);
                  const isNext = next.name === name;
                  return (
                    <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', color: isNext ? 'var(--accent)' : 'var(--text-muted)', textTransform: 'uppercase' }}>{name}</span>
                      <span style={{ fontSize: 13, fontWeight: isNext ? 700 : 400, color: isNext ? 'var(--accent)' : 'var(--text)' }}>
                        {cleanTime((prayerTimes.timings as any)[name])}
                      </span>
                      {isNext && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)' }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ flexShrink: 0, padding: '0 16px 14px' }}>
        <div style={{
          display: 'flex', gap: 6,
          background: 'var(--surface)', borderRadius: 14,
          padding: 4, border: '1px solid var(--border)',
        }}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.Icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                whileTap={{ scale: 0.95 }}
                style={{
                  flex: 1, height: 38,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  background: isActive ? 'var(--accent)' : 'transparent',
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  transition: 'background 0.18s',
                  padding: '0 4px',
                }}
              >
                <Icon
                  size={14} strokeWidth={2}
                  style={{ color: isActive ? 'var(--accent-text)' : 'var(--text-muted)', flexShrink: 0 }}
                />
                <span style={{
                  fontSize: 11, fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-text)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── SWIPEABLE CONTENT ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={tabDir} mode="popLayout">
          <motion.div
            key={activeTab}
            custom={tabDir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={handleDragEnd}
            style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto',
              padding: '0 16px 16px',
              cursor: 'grab',
            }}
          >

            {/* ─── HOW TO PRAY ─── */}
            {activeTab === 'pray' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Progress bar */}
                <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Progress</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                      {prayChecked}/{PRAYER_STEPS.length}
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${(prayChecked / PRAYER_STEPS.length) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Tap each step to mark it complete
                  </p>
                </div>

                {PRAYER_STEPS.map(step => (
                  <StepCard
                    key={step.number}
                    {...step}
                    checked={checked.has(`pray-${step.number}`)}
                    onCheck={() => toggle(`pray-${step.number}`)}
                  />
                ))}

                {prayChecked === PRAYER_STEPS.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '16px', textAlign: 'center',
                      background: 'rgba(var(--accent-rgb),0.08)',
                      border: '1px solid rgba(var(--accent-rgb),0.25)',
                      borderRadius: 16,
                    }}
                  >
                    <p style={{ fontSize: 22, marginBottom: 4 }}>🤲</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Masha'Allah!</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>May Allah accept your prayer.</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─── WUDU ─── */}
            {activeTab === 'wudu' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {/* Progress */}
                <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Wudu Progress</span>
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
                      {wuduChecked}/{WUDU_STEPS.length}
                    </span>
                  </div>
                  <div style={{ height: 5, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${(wuduChecked / WUDU_STEPS.length) * 100}%` }}
                      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                      style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Follow each step in order
                  </p>
                </div>

                {WUDU_STEPS.map(step => (
                  <StepCard
                    key={step.number}
                    {...step}
                    checked={checked.has(`wudu-${step.number}`)}
                    onCheck={() => toggle(`wudu-${step.number}`)}
                  />
                ))}

                {wuduChecked === WUDU_STEPS.length && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    style={{
                      padding: '16px', textAlign: 'center',
                      background: 'rgba(var(--accent-rgb),0.08)',
                      border: '1px solid rgba(var(--accent-rgb),0.25)',
                      borderRadius: 16,
                    }}
                  >
                    <p style={{ fontSize: 22, marginBottom: 4 }}>💧</p>
                    <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Wudu Complete!</p>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>You are now in a state of purity.</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─── PHRASES ─── */}
            {activeTab === 'phrases' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 2 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Prayer Phrases</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap a card to expand and study</p>
                </div>

                {PHRASES.map((p, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setExpandedPhrase(expandedPhrase === i ? null : i)}
                    whileTap={{ scale: 0.985 }}
                    style={{
                      padding: '14px 16px',
                      background: expandedPhrase === i ? 'rgba(var(--accent-rgb),0.06)' : 'var(--surface)',
                      border: `1px solid ${expandedPhrase === i ? 'rgba(var(--accent-rgb),0.25)' : 'var(--border)'}`,
                      borderRadius: 16, cursor: 'pointer',
                      transition: 'background 0.18s, border-color 0.18s',
                    }}
                  >
                    {/* Always visible */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
                        color: 'var(--accent)',
                        background: 'rgba(var(--accent-rgb),0.12)',
                        border: '1px solid rgba(var(--accent-rgb),0.25)',
                        borderRadius: 6, padding: '2px 8px',
                      }}>
                        {p.when}
                      </span>
                      <motion.div animate={{ rotate: expandedPhrase === i ? 90 : 0 }}>
                        <ChevronRight size={14} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
                      </motion.div>
                    </div>

                    <p dir="rtl" style={{
                      fontFamily: "'Amiri', serif", fontSize: 22,
                      color: 'var(--text)', lineHeight: 1.75, textAlign: 'right',
                    }}>
                      {p.arabic}
                    </p>

                    {/* Expanded */}
                    <AnimatePresence>
                      {expandedPhrase === i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: 10 }}>
                            <p style={{ fontSize: 13, color: 'var(--accent)', fontStyle: 'italic', marginBottom: 5 }}>
                              {p.transliteration}
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
                              {p.translation}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ─── RAKAHS ─── */}
            {activeTab === 'rakahs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, marginBottom: 2 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>Daily Prayers</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Obligatory (Fard) + Sunnah rakahs</p>
                </div>

                {/* Visual rakah bar chart */}
                <div style={{ padding: '14px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 14 }}>
                    Fard Rakahs at a Glance
                  </p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 64, justifyContent: 'space-around' }}>
                    {RAKAHS.map(p => (
                      <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{p.fard}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: (p.fard / 4) * 48 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 22, delay: RAKAHS.indexOf(p) * 0.07 }}
                          style={{ width: 28, background: p.color, borderRadius: '6px 6px 4px 4px', opacity: 0.85 }}
                        />
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{p.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {RAKAHS.map((p, i) => (
                  <motion.div
                    key={p.name}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--surface)', border: '1px solid var(--border)',
                      borderRadius: 16,
                      display: 'flex', alignItems: 'center', gap: 14,
                    }}
                  >
                    {/* Color dot */}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, flexShrink: 0 }} />

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{p.name}</p>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 6px' }}>
                          {p.time}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{p.sunnah}</p>
                    </div>

                    {/* Rakah count */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginBottom: 2 }}>
                        {Array.from({ length: p.fard }).map((_, j) => (
                          <motion.div
                            key={j}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.06 + j * 0.05, type: 'spring', stiffness: 400 }}
                            style={{ width: 8, height: 8, borderRadius: 2, background: p.color }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.fard} fard</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PrayerScreen;