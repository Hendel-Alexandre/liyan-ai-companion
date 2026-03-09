import { useState } from "react";
import { Search, MoreHorizontal, Bookmark } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const filters = ["All", "Chats", "Duas", "Recitations", "Prayer Guides"];

const savedItems = [
  { title: "Dua for anxiety and stress", snippet: "Rabbi inni massaniy ad-durru wa anta arhamur-raahimeen", category: "Duas", color: "bg-lime" },
  { title: "How to perform Wudu", snippet: "Step by step guide to ablution before prayer", category: "Prayer Guides", color: "bg-lavender" },
  { title: "Al-Fatihah recitation", snippet: "Bismillahi r-rahmani r-rahim...", category: "Recitations", color: "bg-rose" },
  { title: "What breaks your fast?", snippet: "Common things that invalidate fasting in Ramadan", category: "Chats", color: "bg-lime" },
  { title: "Morning Adhkar", snippet: "Daily morning remembrance supplications", category: "Duas", color: "bg-lavender" },
];

const SavedScreen = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [actionSheet, setActionSheet] = useState<number | null>(null);

  const filtered = activeFilter === "All"
    ? savedItems
    : savedItems.filter((item) => item.category === activeFilter);

  return (
    <div className="topo-pattern min-h-screen bg-background px-5 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1 className="text-[22px] font-outfit font-bold text-foreground">Saved</h1>
        <Search size={22} strokeWidth={1.5} className="text-foreground" />
      </div>

      {/* Filter tabs */}
      <div className="mt-2 flex gap-4 overflow-x-auto pb-3 scrollbar-none">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`flex-shrink-0 pb-1 text-[14px] font-outfit font-medium whitespace-nowrap transition-colors ${
              activeFilter === f
                ? "text-foreground border-b-2 border-lime"
                : "text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Items list */}
      {filtered.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {filtered.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-[16px] bg-card p-3"
              onContextMenu={(e) => {
                e.preventDefault();
                setActionSheet(i);
              }}
            >
              <div className={`h-9 w-9 rounded-full ${item.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-outfit font-medium text-foreground truncate">{item.title}</p>
                <p className="text-[13px] font-outfit text-muted-foreground truncate">{item.snippet}</p>
              </div>
              <button onClick={() => setActionSheet(i)}>
                <MoreHorizontal size={18} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-20 flex flex-col items-center">
          <Bookmark size={48} strokeWidth={1} className="text-muted-foreground mb-4" />
          <p className="text-[16px] font-outfit text-foreground">Nothing saved yet</p>
          <p className="text-[13px] font-outfit text-muted-foreground mt-1">
            Save answers, duas, and lessons here
          </p>
        </div>
      )}

      {/* Action sheet */}
      <AnimatePresence>
        {actionSheet !== null && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50"
              onClick={() => setActionSheet(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            >
              <div className="w-full max-w-[430px] rounded-t-[24px] bg-card p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                <div className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/30 mb-5" />
                {["Open", "Delete", "Share"].map((action) => (
                  <button
                    key={action}
                    onClick={() => setActionSheet(null)}
                    className="w-full text-left py-3 text-[16px] font-outfit text-foreground border-b border-border last:border-0"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedScreen;
