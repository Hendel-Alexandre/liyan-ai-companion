import { Menu, ArrowUpRight, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";

interface HomeScreenProps {
  onNavigate: (tab: string) => void;
}

const historyItems = [
  { text: "Give me a dua for anxiety...", color: "bg-lime" },
  { text: "How to perform Wudu correctly...", color: "bg-lavender" },
  { text: "What are the pillars of Islam...", color: "bg-rose" },
];

const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  return (
    <div className="topo-pattern min-h-screen bg-background px-5 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <Menu size={22} strokeWidth={1.5} className="text-foreground" />
        <span className="text-[18px] font-outfit font-medium text-foreground">
          Hi, User 👋
        </span>
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-lavender to-lime" />
      </div>

      {/* Hero */}
      <h1 className="mt-2 text-[26px] font-outfit font-bold tracking-tight-custom text-foreground leading-tight">
        How may I help<br />you today?
      </h1>

      {/* Bento Grid */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {/* Tall lime card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("chat")}
          className="row-span-2 flex flex-col justify-between rounded-[24px] bg-lime p-4 text-left"
          style={{ aspectRatio: "2/3", minHeight: 200 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8 2 4 5 4 9c0 3 2 5 4 6v3l3-2h1c4 0 8-3 8-7s-4-7-8-7z" />
              </svg>
            </div>
            <ArrowUpRight size={18} strokeWidth={1.5} className="text-primary-foreground" />
          </div>
          <span className="text-[16px] font-outfit font-bold text-primary-foreground">
            Talk with<br />Liyan
          </span>
        </motion.button>

        {/* Lavender card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("chat")}
          className="flex flex-col justify-between rounded-[24px] bg-lavender p-4 text-left"
          style={{ aspectRatio: "1/1" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <ArrowUpRight size={16} strokeWidth={1.5} className="text-primary-foreground" />
          </div>
          <span className="text-[14px] font-outfit font-semibold text-primary-foreground">
            Ask a<br />Question
          </span>
        </motion.button>

        {/* Rose card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate("prayer")}
          className="flex flex-col justify-between rounded-[24px] bg-rose p-4 text-left"
          style={{ aspectRatio: "1/1" }}
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-1 4-4 6-4 10a4 4 0 0 0 8 0c0-4-3-6-4-10z" />
              </svg>
            </div>
            <ArrowUpRight size={16} strokeWidth={1.5} className="text-primary-foreground" />
          </div>
          <span className="text-[14px] font-outfit font-semibold text-primary-foreground">
            Learn<br />Prayer
          </span>
        </motion.button>
      </div>

      {/* History */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-outfit font-bold text-foreground">History</h2>
          <span className="text-[13px] font-outfit text-muted-foreground">See all</span>
        </div>
        <div className="flex flex-col gap-3">
          {historyItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="flex items-center gap-3 rounded-[16px] bg-card p-3.5"
            >
              <div className={`h-8 w-8 rounded-full ${item.color} flex-shrink-0`} />
              <span className="flex-1 text-[14px] font-outfit text-foreground truncate">
                {item.text}
              </span>
              <MoreHorizontal size={18} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
