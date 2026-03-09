import { useState } from "react";
import { ArrowLeft, Bookmark, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { motion } from "framer-motion";

const surahs = [
  { ar: "الفاتحة", en: "Al-Fatihah" },
  { ar: "الإخلاص", en: "Al-Ikhlas" },
  { ar: "الفلق", en: "Al-Falaq" },
  { ar: "الناس", en: "An-Nas" },
  { ar: "أدعية يومية", en: "Daily Duas" },
];

const verses = [
  {
    ar: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    transliteration: "Bismillāhi r-raḥmāni r-raḥīm",
    translation: "In the name of Allah, the Most Gracious, the Most Merciful",
  },
  {
    ar: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
    transliteration: "Al-ḥamdu lillāhi rabbi l-ʿālamīn",
    translation: "All praise is due to Allah, Lord of all the worlds",
  },
  {
    ar: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
    transliteration: "Ar-raḥmāni r-raḥīm",
    translation: "The Most Gracious, the Most Merciful",
  },
];

type Toggle = "arabic" | "transliteration" | "translation";

const ReciteScreen = () => {
  const [activeVerse, setActiveVerse] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toggles, setToggles] = useState<Toggle[]>(["arabic", "transliteration", "translation"]);
  const [mode, setMode] = useState("listen");

  const toggleView = (t: Toggle) => {
    setToggles((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const verse = verses[activeVerse];

  return (
    <div className="topo-pattern min-h-screen bg-background px-5 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <ArrowLeft size={22} strokeWidth={1.5} className="text-foreground" />
        <span className="text-[18px] font-outfit font-bold text-foreground">Recite</span>
        <Bookmark size={22} strokeWidth={1.5} className="text-foreground" />
      </div>

      {/* Featured row */}
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {surahs.map((s, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.97 }}
            className="flex-shrink-0 flex flex-col justify-between rounded-[16px] bg-card p-3"
            style={{ width: 120, height: 80 }}
          >
            <span className="text-[14px] font-amiri text-foreground">{s.ar}</span>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-outfit text-muted-foreground">{s.en}</span>
              <Play size={12} strokeWidth={1.5} className="text-muted-foreground" />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Active recitation card */}
      <div className="mt-6 rounded-[24px] bg-card p-6">
        {toggles.includes("arabic") && (
          <p className="text-center text-[28px] font-amiri text-foreground leading-loose mb-4">
            {verse.ar}
          </p>
        )}
        {toggles.includes("transliteration") && (
          <p className="text-center text-[14px] font-outfit text-muted-foreground mb-2">
            {verse.transliteration}
          </p>
        )}
        {toggles.includes("translation") && (
          <p className="text-center text-[15px] font-outfit text-foreground">
            {verse.translation}
          </p>
        )}

        {/* Toggle pills */}
        <div className="mt-5 flex justify-center gap-2">
          {(["arabic", "transliteration", "translation"] as Toggle[]).map((t) => (
            <button
              key={t}
              onClick={() => toggleView(t)}
              className={`rounded-full px-3 py-1.5 text-[12px] font-outfit font-medium transition-colors ${
                toggles.includes(t)
                  ? "bg-lime text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Playback controls */}
      <div className="mt-6 flex items-center justify-center gap-8">
        <button
          onClick={() => setActiveVerse(Math.max(0, activeVerse - 1))}
        >
          <SkipBack size={22} strokeWidth={1.5} className="text-foreground" />
        </button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-lime"
        >
          {isPlaying ? (
            <Pause size={22} strokeWidth={1.5} className="text-primary-foreground" />
          ) : (
            <Play size={22} strokeWidth={1.5} className="text-primary-foreground ml-0.5" />
          )}
        </motion.button>
        <button
          onClick={() => setActiveVerse(Math.min(verses.length - 1, activeVerse + 1))}
        >
          <SkipForward size={22} strokeWidth={1.5} className="text-foreground" />
        </button>
      </div>

      {/* Slow / Repeat pills */}
      <div className="mt-4 flex justify-center gap-3">
        <button className="rounded-full bg-card border border-border px-4 py-1.5 text-[12px] font-outfit text-muted-foreground">
          Slow mode
        </button>
        <button className="rounded-full bg-card border border-border px-4 py-1.5 text-[12px] font-outfit text-muted-foreground">
          Repeat
        </button>
      </div>

      {/* Mode selector */}
      <div className="mt-8 flex justify-center gap-2">
        {["Listen", "Line-by-Line", "Repeat After Me"].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m.toLowerCase())}
            className={`rounded-full px-4 py-2 text-[12px] font-outfit font-medium transition-colors ${
              mode === m.toLowerCase()
                ? "bg-card text-lime"
                : "text-muted-foreground"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReciteScreen;
