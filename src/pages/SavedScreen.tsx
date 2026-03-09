import { useState } from "react";
import { Search, Ellipsis, Bookmark, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSaved, SavedItem } from "@/context/SavedContext";

const filters = ["All", "Chats", "Duas", "Prayer", "Recitations"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  Chats: "var(--accent)",
  Duas: "#A78BFA",
  Prayer: "#60A5FA",
  Recitations: "#F472B6",
};

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - ts) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const SavedScreen = () => {
  const { items, removeItem } = useSaved();
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [swipedId, setSwipedId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<SavedItem | null>(null);

  const filtered =
    activeFilter === "All" ? items : items.filter((i) => i.category === activeFilter);

  return (
    <div
      className="flex flex-col pb-24"
      style={{
        minHeight: "100dvh",
        background: "var(--bg)",
        paddingTop: "max(1.2rem, env(safe-area-inset-top))",
      }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 mb-4" style={{ flex: "0 0 auto" }}>
        <div>
          <p className="text-[11px] font-inter uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.07em" }}>Library</p>
          <h1 className="text-[22px] font-inter font-bold tracking-tight-custom" style={{ color: "var(--text)" }}>Saved</h1>
        </div>
        <button
          className="flex h-9 w-9 items-center justify-center"
          style={{ background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}
        >
          <Search size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-5 mb-3" style={{ flex: "0 0 auto" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="flex-shrink-0 text-[12px] font-inter font-medium whitespace-nowrap px-3 py-1.5"
            style={{
              background: activeFilter === f ? "var(--accent)" : "var(--surface)",
              color: activeFilter === f ? "var(--accent-text)" : "var(--text-muted)",
              border: `1px solid ${activeFilter === f ? "var(--accent)" : "var(--border)"}`,
              borderRadius: 8,
              transition: "all 0.15s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="scroll-y flex-1 px-5" style={{ minHeight: 0 }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center mt-20">
            <div
              className="flex h-16 w-16 items-center justify-center mb-4"
              style={{ background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}
            >
              <Bookmark size={28} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="text-[16px] font-inter font-semibold" style={{ color: "var(--text)" }}>Nothing saved yet</p>
            <p className="text-[13px] font-inter mt-1 text-center max-w-[200px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Chat with Liyan and your exchanges will appear here
            </p>
          </div>
        ) : (
          <motion.div layout className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, scale: 0.97 }}
                  transition={{ duration: 0.22 }}
                  className="relative overflow-hidden"
                  style={{ borderRadius: 12 }}
                >
                  {/* Delete button (swipe reveal) */}
                  <AnimatePresence>
                    {swipedId === item.id && (
                      <motion.button
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 70, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        onClick={() => removeItem(item.id)}
                        className="absolute right-0 top-0 bottom-0 flex items-center justify-center text-[13px] font-inter font-semibold"
                        style={{ background: "#EF4444", color: "#fff", borderRadius: "0 12px 12px 0" }}
                      >
                        Delete
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Row */}
                  <motion.div
                    animate={{ x: swipedId === item.id ? -70 : 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    className="flex items-center gap-3 px-3"
                    style={{
                      height: 52,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                    }}
                    onClick={() => {
                      if (swipedId === item.id) { setSwipedId(null); return; }
                      setModalItem(item);
                    }}
                    onContextMenu={(e) => { e.preventDefault(); setSwipedId(swipedId === item.id ? null : item.id); }}
                  >
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{ background: CATEGORY_COLORS[item.category] || "var(--accent)" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-inter font-medium truncate" style={{ color: "var(--text)" }}>
                        {item.title}
                      </p>
                      <p className="text-[12px] font-inter truncate" style={{ color: "var(--text-muted)" }}>
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSwipedId(swipedId === item.id ? null : item.id); }}
                    >
                      <Ellipsis size={16} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalItem && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: "rgba(0,0,0,0.65)" }}
              onClick={() => setModalItem(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
            >
              <div
                className="w-full max-w-[430px] pb-[max(2rem,env(safe-area-inset-bottom))]"
                style={{
                  background: "var(--surface)",
                  borderRadius: "20px 20px 0 0",
                  border: "1px solid var(--border)",
                  borderBottom: "none",
                  padding: "20px 20px max(2rem, env(safe-area-inset-bottom))",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[16px] font-inter font-semibold" style={{ color: "var(--text)" }}>
                    {modalItem.title}
                  </p>
                  <button onClick={() => setModalItem(null)}>
                    <X size={18} strokeWidth={1.5} style={{ color: "var(--text-muted)" }} />
                  </button>
                </div>
                <div
                  className="text-[14px] font-inter leading-relaxed scroll-y"
                  style={{ color: "var(--text)", maxHeight: 300, color: "var(--text)" }}
                >
                  {modalItem.fullContent || modalItem.snippet}
                </div>
                <button
                  onClick={() => { removeItem(modalItem.id); setModalItem(null); }}
                  className="mt-5 text-[14px] font-inter font-medium"
                  style={{ color: "#EF4444" }}
                >
                  Delete this item
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavedScreen;
