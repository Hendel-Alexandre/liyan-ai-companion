import { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Bookmark, BookMarked, Loader, Gauge, Repeat } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { getAllReciteItems } from '@/services/reciteService';
import { useSaved } from '@/context/SavedContext';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import type { ReciteItem } from '@/services/types';

const BG_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2014_21_22-Task%20Manager.png';
const NATURE_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2016_37_57-Pictures%20-%20File%20Explorer.png';

/* ══════════════════════════════════════════
   WAVEFORM (decorative visual)
══════════════════════════════════════════ */
const Waveform = ({ playing }: { playing: boolean }) => {
  const bars = [3, 8, 5, 12, 7, 14, 9, 6, 13, 5, 10, 7, 4, 11, 8, 5, 12, 9, 6, 14, 7, 5, 10, 8];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 28 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          animate={playing ? { scaleY: [1, 1.8, 0.6, 1.4, 1], opacity: [0.4, 1, 0.5, 0.9, 0.4] } : { scaleY: 1, opacity: 0.25 }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
          style={{ width: 2.5, height: h, background: 'var(--accent)', borderRadius: 2, transformOrigin: 'center' }}
        />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════
   RECITE SCREEN
══════════════════════════════════════════ */
const ReciteScreen = () => {
  const items = getAllReciteItems();
  const { addItem, removeItem, items: savedItems } = useSaved();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [verseIdx, setVerseIdx] = useState(0);
  const [verseDir, setVerseDir] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slowMode, setSlowMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [showArabic, setArabic] = useState(true);
  const [showTranslit, setTranslit] = useState(true);
  const [showTranslate, setTrans] = useState(true);
  const [mode, setMode] = useState<'listen' | 'line' | 'repeat'>('line');

  const selected = items[selectedIdx];
  const verse = selected.verses[verseIdx];
  const savedId = `recite-${selected.id}`;
  const isSaved = savedItems.some(i => i.id === savedId);

  // Real audio player
  const audio = useAudioPlayer(verse.audioUrl);

  // When verse or surah changes → update audio URL
  useEffect(() => {
    if (verse.audioUrl) audio.setUrl(verse.audioUrl);
    else audio.pause();
  }, [verseIdx, selectedIdx]);

  // Auto-advance to next verse when audio ends (listen mode)
  useEffect(() => {
    if (!audio.isPlaying && audio.progress === 0 && audio.duration > 0) {
      // ended
      if (mode === 'listen' && verseIdx < selected.verses.length - 1) {
        setTimeout(() => goVerse(1), 700);
      }
    }
  }, [audio.isPlaying, audio.progress]);

  const save = () => {
    if (isSaved) { removeItem(savedId); return; }
    addItem({
      id: savedId,
      title: `${selected.title} (${selected.arabicTitle})`,
      snippet: selected.verses[0]?.translation || '',
      category: 'Recitations',
      fullContent: selected.verses.map(v =>
        `${v.arabic}\n${v.transliteration}\n${v.translation}`
      ).join('\n\n'),
    });
  };

  const goSurah = (idx: number) => {
    if (idx < 0 || idx >= items.length) return;
    setSelectedIdx(idx);
    setVerseIdx(0);
    audio.pause();
  };

  const goVerse = (dir: number) => {
    const next = verseIdx + dir;
    if (next < 0 || next >= selected.verses.length) return;
    setVerseDir(dir);
    setVerseIdx(next);
    audio.pause();
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (info.offset.x < -55 && info.velocity.x < 0) goVerse(1);
    else if (info.offset.x > 55 && info.velocity.x > 0) goVerse(-1);
  };

  const verseVariants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.93,
    }),
    center: {
      x: 0, opacity: 1, scale: 1,
      transition: { type: 'spring' as const, stiffness: 340, damping: 32 },
    },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0, scale: 0.93,
      transition: { duration: 0.16 },
    }),
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

      {/* ══ HEADER ══ */}
      <div style={{ flexShrink: 0, padding: '0 18px 10px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>AL-QURAN</p>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>Recite</h1>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={save}
          style={{ width: 34, height: 34, borderRadius: 10, background: 'var(--surface)', border: `1px solid ${isSaved ? 'rgba(var(--accent-rgb),0.4)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {isSaved
            ? <BookMarked size={15} strokeWidth={1.5} style={{ color: 'var(--accent)' }} />
            : <Bookmark size={15} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />}
        </motion.button>
      </div>

      {/* ══ SURAH PICKER ══ */}
      <div style={{ flexShrink: 0, paddingBottom: 12 }}>
        <div style={{ display: 'flex', gap: 7, overflowX: 'auto', padding: '2px 16px', scrollbarWidth: 'none' }}>
          {items.map((item, i) => (
            <motion.button key={item.id} whileTap={{ scale: 0.93 }}
              onClick={() => goSurah(i)}
              style={{
                flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 12px', gap: 4,
                background: selectedIdx === i ? 'rgba(var(--accent-rgb),0.1)' : 'var(--surface)',
                border: `1px solid ${selectedIdx === i ? 'rgba(var(--accent-rgb),0.4)' : 'var(--border)'}`,
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s',
                minWidth: 70,
              }}>
              <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 14, color: selectedIdx === i ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 1 }}>{item.arabicTitle}</p>
              <p style={{ fontSize: 10, color: selectedIdx === i ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>{item.title}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ══ NOW PLAYING CARD (image bg) ══ */}
      <div style={{ flexShrink: 0, padding: '0 16px 12px' }}>
        <div style={{ height: 80, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${NATURE_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.72) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 90% 110%, rgba(var(--accent-rgb),0.2) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--accent)', background: 'rgba(var(--accent-rgb),0.18)', border: '1px solid rgba(var(--accent-rgb),0.3)', borderRadius: 5, padding: '2px 7px' }}>
                  {selected.type?.toUpperCase() || 'SURAH'}
                </span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                  {verseIdx + 1} / {selected.verses.length} verses
                </span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>{selected.title}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 22, color: 'rgba(255,255,255,0.85)', lineHeight: 1 }}>{selected.arabicTitle}</p>
              <Waveform playing={playing} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ TOGGLE PILLS ══ */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0 16px 10px' }}>
        {[
          { label: 'Arabic', val: showArabic, set: setArabic },
          { label: 'Translit', val: showTranslit, set: setTranslit },
          { label: 'English', val: showTranslate, set: setTrans },
        ].map(({ label, val, set }) => (
          <motion.button key={label} whileTap={{ scale: 0.95 }}
            onClick={() => set(v => !v)}
            style={{ padding: '5px 11px', fontSize: 11, fontWeight: 500, background: val ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface)', color: val ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${val ? 'rgba(var(--accent-rgb),0.3)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
            {label}
          </motion.button>
        ))}
        <div style={{ flex: 1 }} />
        {/* Slow + Repeat */}
        {[
          { Icon: Gauge, val: slowMode, set: setSlowMode, label: 'Slow' },
          { Icon: Repeat, val: repeatMode, set: setRepeatMode, label: 'Loop' },
        ].map(({ Icon, val, set, label }) => (
          <motion.button key={label} whileTap={{ scale: 0.95 }}
            onClick={() => set(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 9px', fontSize: 11, fontWeight: 500, background: val ? 'rgba(var(--accent-rgb),0.12)' : 'var(--surface)', color: val ? 'var(--accent)' : 'var(--text-muted)', border: `1px solid ${val ? 'rgba(var(--accent-rgb),0.3)' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s' }}>
            <Icon size={12} strokeWidth={1.5} />
            {label}
          </motion.button>
        ))}
      </div>

      {/* ══ SWIPEABLE VERSE CARD ══ */}
      <div style={{ flex: 1, padding: '0 16px', position: 'relative', minHeight: 0 }}>
        {/* Drag layer */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDrag}
          style={{ position: 'absolute', inset: '0 16px', zIndex: 2, cursor: 'grab' }}
          whileTap={{ cursor: 'grabbing' }}
        />

        {/* Animated verse */}
        <AnimatePresence initial={false} custom={verseDir} mode="popLayout">
          <motion.div
            key={`${selected.id}-${verseIdx}`}
            custom={verseDir}
            variants={verseVariants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 18,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            {/* Accent top strip */}
            <div style={{ height: 3, background: `linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb),0.2))`, width: '100%' }} />

            <div style={{ padding: '16px 18px', height: '100%', display: 'flex', flexDirection: 'column' }}>

              {/* Verse badge row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.12)', border: '1px solid rgba(var(--accent-rgb),0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{verse.number}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', lineHeight: 1 }}>{selected.title}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Verse {verse.number} of {selected.verses.length}</p>
                  </div>
                </div>

                {/* Progress pips */}
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {selected.verses.slice(0, Math.min(selected.verses.length, 8)).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i === verseIdx % 8 ? 16 : 5,
                        background: i === verseIdx % 8 ? 'var(--accent)' : i < verseIdx % 8 ? 'rgba(var(--accent-rgb),0.4)' : 'var(--surface2)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      style={{ height: 5, borderRadius: 3 }}
                    />
                  ))}
                </div>
              </div>

              {/* Scrollable content */}
              <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>

                {/* Arabic */}
                {showArabic && (
                  <motion.p
                    key={`ar-${verseIdx}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                    dir="rtl"
                    style={{ fontFamily: "'Amiri', serif", fontSize: 28, lineHeight: 2.1, color: 'var(--text)', textAlign: 'right', marginBottom: 14 }}
                  >
                    {verse.arabic}
                  </motion.p>
                )}

                {/* Divider */}
                {showArabic && (showTranslit || showTranslate) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(var(--accent-rgb),0.4)' }} />
                    <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  </div>
                )}

                {/* Transliteration */}
                {showTranslit && (
                  <motion.p
                    key={`tr-${verseIdx}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                    style={{ fontSize: 14, color: 'var(--accent)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: showTranslate ? 10 : 0 }}
                  >
                    {verse.transliteration}
                  </motion.p>
                )}

                {/* Translation */}
                {showTranslate && (
                  <motion.div
                    key={`en-${verseIdx}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}
                  >
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                      {verse.translation}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Swipe hint */}
              <p style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', opacity: 0.45, marginTop: 10, flexShrink: 0 }}>
                ← swipe to navigate →
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ══ MODE SELECTOR ══ */}
      <div style={{ flexShrink: 0, padding: '10px 16px 8px' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 11, padding: 3 }}>
          {(['listen', 'line', 'repeat'] as const).map(m => (
            <motion.button key={m} whileTap={{ scale: 0.96 }}
              onClick={() => setMode(m)}
              style={{ flex: 1, height: 30, background: mode === m ? 'var(--accent)' : 'transparent', color: mode === m ? 'var(--accent-text)' : 'var(--text-muted)', border: 'none', borderRadius: 8, fontSize: 10, fontWeight: mode === m ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
              {m === 'listen' ? 'Listen' : m === 'line' ? 'Line-by-Line' : 'Repeat After Me'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ══ PLAYER BAR ══ */}
      <div style={{
        flexShrink: 0,
        padding: '8px 16px 0',
        borderTop: '1px solid var(--border)',
        background: 'rgba(242,242,247,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Prev surah */}
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => goSurah(selectedIdx - 1)}
            disabled={selectedIdx === 0}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: selectedIdx > 0 ? 'pointer' : 'default', opacity: selectedIdx === 0 ? 0.25 : 1, padding: '4px 8px' }}>
            <SkipBack size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Prev</span>
          </motion.button>

          {/* Verse nav + play */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => goVerse(-1)}
              disabled={verseIdx === 0}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: verseIdx > 0 ? 'pointer' : 'default', opacity: verseIdx === 0 ? 0.3 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>

            <motion.button whileTap={{ scale: 0.92 }}
              onClick={() => {
                if (verse.audioUrl) audio.toggle();
              }}
              style={{ width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent)', borderRadius: '50%', border: 'none', cursor: verse.audioUrl ? 'pointer' : 'not-allowed', boxShadow: `0 0 18px rgba(var(--accent-rgb),0.35)`, opacity: verse.audioUrl ? 1 : 0.5 }}>
              {audio.isLoading
                ? <Loader size={18} strokeWidth={1.8} style={{ color: 'var(--accent-text)', animation: 'spin 1s linear infinite' }} />
                : audio.isPlaying
                  ? <Pause size={20} strokeWidth={1.8} style={{ color: 'var(--accent-text)' }} />
                  : <Play size={20} strokeWidth={1.8} style={{ color: 'var(--accent-text)', marginLeft: 2 }} />}
            </motion.button>

            <motion.button whileTap={{ scale: 0.9 }}
              onClick={() => goVerse(1)}
              disabled={verseIdx === selected.verses.length - 1}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, cursor: verseIdx < selected.verses.length - 1 ? 'pointer' : 'default', opacity: verseIdx === selected.verses.length - 1 ? 0.3 : 1 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2L10 7L5 12" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          </div>

          {/* Next surah */}
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => goSurah(selectedIdx + 1)}
            disabled={selectedIdx === items.length - 1}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', cursor: selectedIdx < items.length - 1 ? 'pointer' : 'default', opacity: selectedIdx === items.length - 1 ? 0.25 : 1, padding: '4px 8px' }}>
            <SkipForward size={18} strokeWidth={1.5} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>Next</span>
          </motion.button>

        </div>
      </div>
    </div>
  );
};

export default ReciteScreen;