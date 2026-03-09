import { useState, useRef } from 'react';


import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

import { getDailyAyah } from '@/services/ayahService';
import { getDailyDua } from '@/services/duaService';

const BG_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2014_21_22-Task%20Manager.png';
const HERO_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2014_21_55-Task%20Manager.png';
const NATURE_IMAGE = 'https://pub-40cdcc7d351e4500b399211df2b4a06a.r2.dev/2026-03-09%2016_37_57-Pictures%20-%20File%20Explorer.png';


interface Props { onNavigate: (tab: string, data?: any) => void; }

/* ─── Swipeable Daily Carousel ─── */
const DailyCarousel = ({ ayah, dua, onNavigate }: { ayah: any; dua: any; onNavigate: (tab: string) => void }) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const cards = [
    {
      id: 'verse',
      eyebrow: 'Verse of the Day',
      tag: 'QURAN',
      arabic: ayah.arabic,
      subtitle: `"${ayah.translation}"`,
      reference: ayah.reference,
      overlayColor: 'rgba(0,0,0,0.62)',
      accentOverlay: 'rgba(var(--accent-rgb),0.18)',
    },
    {
      id: 'dua',
      eyebrow: 'Daily Dua',
      tag: 'DUA',
      arabic: dua.arabic,
      subtitle: dua.translation,
      reference: dua.occasion || 'Hisnul Muslim',
      overlayColor: 'rgba(0,0,0,0.75)',
      accentOverlay: 'rgba(80,40,120,0.30)',
      bgImage: NATURE_IMAGE,
    },
    {
      id: 'cta',
      eyebrow: 'Ask Anything',
      tag: 'LIYAN AI',
      arabic: 'اسألني عن الإسلام',
      subtitle: 'Voice or text — your Islamic companion, always here.',
      reference: null,
      overlayColor: 'rgba(0,0,0,0.72)',
      accentOverlay: 'rgba(var(--accent-rgb),0.22)',
      isCTA: true,
    },
  ];

  const goTo = (dir: number) => {
    const next = index + dir;
    if (next < 0 || next >= cards.length) return;
    setDirection(dir);
    setIndex(next);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -55) goTo(1);
    else if (info.offset.x > 55) goTo(-1);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.93 }),
    center: { x: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 30 } },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0, scale: 0.93, transition: { duration: 0.18 } }),
  };

  const card = cards[index];

  return (
    <div style={{ flexShrink: 0, paddingTop: 10 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px 8px' }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Daily</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          {cards.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i); }}
              animate={{ width: i === index ? 18 : 5, background: i === index ? 'var(--accent)' : 'var(--surface2)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ height: 5, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0 }}
            />
          ))}
        </div>
      </div>

      {/* Card viewport */}
      <div style={{ padding: '0 16px', position: 'relative' }}>
        <div style={{ position: 'relative', height: 172, borderRadius: 20, overflow: 'hidden' }}>
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={card.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              style={{ position: 'absolute', inset: 0, cursor: 'grab', userSelect: 'none' }}
              whileTap={{ cursor: 'grabbing' }}
            >
              {/* Background image — per-card or fallback to BG_IMAGE */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${(card as any).bgImage || BG_IMAGE})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />

              {/* Dark overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(150deg, ${card.overlayColor} 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)`,
              }} />

              {/* Accent bloom */}
              <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse at 80% 110%, ${card.accentOverlay} 0%, transparent 60%)`,
              }} />

              {/* Subtle grain texture */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")',
                opacity: 0.4,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
              }} />

              {/* Content */}
              <div style={{
                position: 'absolute', inset: 0,
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{
                      display: 'inline-block',
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                      color: 'var(--accent)',
                      background: 'rgba(var(--accent-rgb),0.15)',
                      border: '1px solid rgba(var(--accent-rgb),0.3)',
                      borderRadius: 6, padding: '3px 8px', marginBottom: 4,
                    }}>
                      {card.tag}
                    </span>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.01em' }}>
                      {card.eyebrow}
                    </p>
                  </div>

                  {/* Nav arrows */}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {index > 0 && (
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => goTo(-1)}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M6.5 2L3.5 5L6.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    )}
                    {index < cards.length - 1 && (
                      <motion.button
                        whileTap={{ scale: 0.88 }}
                        onClick={() => goTo(1)}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M3.5 2L6.5 5L3.5 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Arabic text */}
                <p style={{
                  fontFamily: "'Amiri', Georgia, serif",
                  fontSize: card.id === 'cta' ? 20 : 22,
                  lineHeight: 1.75,
                  color: '#FFFFFF',
                  textAlign: 'right',
                  direction: 'rtl',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  margin: '2px 0',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {card.arabic}
                </p>

                {/* Bottom */}
                <div>
                  <p style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.65)',
                    lineHeight: 1.45,
                    fontStyle: 'italic',
                    marginBottom: 8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {card.subtitle}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    {/* Reference */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <div style={{ width: 20, height: 2, background: 'var(--accent)', borderRadius: 2, opacity: 0.9 }} />
                      {card.reference && (
                        <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.02em' }}>
                          {card.reference}
                        </span>
                      )}
                    </div>

                    {/* CTA button */}
                    {card.isCTA && (
                      <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={() => onNavigate('chat')}
                        style={{
                          height: 30, background: 'var(--accent)', color: 'var(--accent-text)',
                          borderRadius: 8, padding: '0 12px', fontSize: 12, fontWeight: 600,
                          border: 'none', cursor: 'pointer',
                        }}
                      >
                        Ask Now →
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   HOME SCREEN
═══════════════════════════════════════ */
const HomeScreen = ({ onNavigate }: Props) => {
  const { userName } = useSettings();
  const ayah = getDailyAyah();
  const dua = getDailyDua();
  const displayName = userName.trim() || 'User';

  return (
    <div style={{
      height: '100dvh',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      paddingTop: 'max(0.75rem, env(safe-area-inset-top))',
      paddingBottom: 'calc(72px + max(0px, env(safe-area-inset-bottom)))',
    }}>

      {/* ── TOP BAR ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', height: 44, flexShrink: 0 }}>
        <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
          Liyan <span style={{ color: 'var(--accent)' }}>AI</span>
        </span>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'var(--surface2)',
          border: '1px solid var(--border-strong)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
            {displayName[0].toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── BISMILLAH ── */}
      <div style={{ textAlign: 'center', height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Amiri', serif", fontSize: 15, color: 'var(--text-soft)', direction: 'rtl' }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </span>
      </div>

      {/* ── GREETING ── */}
      <div style={{ padding: '6px 18px 8px', flexShrink: 0 }}>
        <p dir="rtl" style={{ fontFamily: "'Amiri', serif", fontSize: 26, color: 'var(--text)', lineHeight: 1.3, marginBottom: 3 }}>
          السَّلَامُ عَلَيْكُم
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          Wa Alaykum Assalam, {displayName}
        </p>
      </div>

      {/* ── HERO CARD ── */}
      <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
        <div style={{
          height: 110,
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        }}>
          {/* Layer 1: image */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          {/* Layer 2: dark gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(150deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.78) 100%)', pointerEvents: 'none' }} />
          {/* Layer 3: accent bloom */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 85% 110%, rgba(var(--accent-rgb),0.22) 0%, transparent 60%)', pointerEvents: 'none' }} />
          {/* Content */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ flex: 1, padding: '0 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
              <span style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Ask Liyan
              </span>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '-0.025em', lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                Your Islamic<br />Companion
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('chat')}
                style={{ alignSelf: 'flex-start', height: 32, background: 'var(--accent)', color: 'var(--accent-text)', borderRadius: 9, padding: '0 13px', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Start Talking
              </motion.button>
            </div>
            <div style={{ width: '38%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: 16 }}>
              <div className="orb" style={{ width: 80, height: 80 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── DAILY CAROUSEL (image bg + swipe) ── */}
      <DailyCarousel ayah={ayah} dua={dua} onNavigate={onNavigate} />

    </div>
  );
};

export default HomeScreen;