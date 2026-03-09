import { useState } from "react";
import { ArrowUpRight, Filter, Droplets, MessageCircle, Clock, AlertTriangle, ArrowLeft, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const chips = ["How to pray", "Wudu steps", "Prayer phrases", "How many rakahs"];

const categories = [
  { title: "Wudu Guide", icon: Droplets, color: "bg-lavender", textColor: "text-primary-foreground" },
  { title: "Prayer Phrases", icon: MessageCircle, color: "bg-rose", textColor: "text-primary-foreground" },
  { title: "Prayer Times", icon: Clock, color: "bg-card", textColor: "text-foreground" },
  { title: "Common Mistakes", icon: AlertTriangle, color: "bg-card", textColor: "text-foreground" },
];

const wuduSteps = [
  { step: 1, title: "Intention (Niyyah)", desc: "Make the intention in your heart to perform wudu for the sake of Allah." },
  { step: 2, title: "Say Bismillah", desc: "Begin by saying 'Bismillah' (In the name of Allah)." },
  { step: 3, title: "Wash Hands", desc: "Wash both hands up to the wrists three times, starting with the right." },
  { step: 4, title: "Rinse Mouth", desc: "Take water in the right hand and rinse the mouth three times." },
  { step: 5, title: "Clean Nose", desc: "Sniff water into the nostrils and blow it out three times." },
  { step: 6, title: "Wash Face", desc: "Wash the entire face from forehead to chin and ear to ear, three times." },
];

const PrayerScreen = () => {
  const [detailOpen, setDetailOpen] = useState<string | null>(null);

  if (detailOpen) {
    return (
      <div className="topo-pattern min-h-screen bg-background px-5 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-3 py-4">
          <button onClick={() => setDetailOpen(null)}>
            <ArrowLeft size={22} strokeWidth={1.5} className="text-foreground" />
          </button>
          <h1 className="text-[20px] font-outfit font-bold text-foreground">{detailOpen}</h1>
        </div>
        <div className="flex flex-col gap-3 mt-2">
          {wuduSteps.map((s) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: s.step * 0.05 }}
              className="rounded-[16px] bg-card p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-lime text-[13px] font-outfit font-bold text-primary-foreground flex-shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-outfit font-semibold text-foreground">{s.title}</h3>
                    <p className="text-[13px] font-outfit text-muted-foreground mt-1 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-lime flex-shrink-0 ml-2">
                  <Play size={14} strokeWidth={1.5} className="text-primary-foreground ml-0.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="topo-pattern min-h-screen bg-background px-5 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="text-[22px] font-outfit font-bold text-foreground">Prayer Guide</h1>
        <Filter size={22} strokeWidth={1.5} className="text-foreground" />
      </div>

      {/* Chips */}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {chips.map((c) => (
          <button
            key={c}
            className="flex-shrink-0 rounded-[20px] bg-card px-3 py-2 text-[13px] font-outfit text-foreground whitespace-nowrap"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Featured card */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setDetailOpen("Step-by-Step Prayer Guide")}
        className="mt-5 w-full rounded-[24px] bg-lime p-5 text-left relative"
      >
        <ArrowUpRight size={18} strokeWidth={1.5} className="text-primary-foreground absolute top-4 right-4" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3c-1 4-4 6-4 10a4 4 0 0 0 8 0c0-4-3-6-4-10z" />
          </svg>
        </div>
        <h2 className="text-[18px] font-outfit font-bold text-primary-foreground">Step-by-Step Prayer Guide</h2>
        <p className="text-[13px] font-outfit text-primary-foreground/70 mt-1">Learn salah from the beginning</p>
      </motion.button>

      {/* Category grid */}
      <div className="mt-5 grid grid-cols-2 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <motion.button
              key={cat.title}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDetailOpen(cat.title)}
              className={`rounded-[16px] ${cat.color} p-4 text-left relative`}
              style={{ minHeight: 110 }}
            >
              <ArrowUpRight size={14} strokeWidth={1.5} className={`${cat.textColor} absolute top-3 right-3 opacity-60`} />
              <Icon size={22} strokeWidth={1.5} className={cat.textColor} />
              <span className={`block mt-3 text-[14px] font-outfit font-semibold ${cat.textColor}`}>
                {cat.title}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerScreen;
