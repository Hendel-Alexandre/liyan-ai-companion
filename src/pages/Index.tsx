import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomTabs from "@/components/layout/BottomTabs";
import { AmbientBackground } from "@/components/ambient/AmbientBackground";
import HomeScreen from "./HomeScreen";
import ChatScreen from "./ChatScreen";
import ReciteScreen from "./ReciteScreen";
import LearnScreen from "./LearnScreen";
import SettingsScreen from "./SettingsScreen";
import SavedScreen from "./SavedScreen";
import QuizScreen from "./QuizScreen";
import AuthScreen from "./AuthScreen";
import { useAuth } from "@/context/AuthContext";
import type { QuizDifficulty } from "@/services/quizService";

type SubScreen =
  | { type: "quiz"; difficulty: QuizDifficulty }
  | { type: "saved" }
  | null;

const TABS = ["home", "recite", "chat", "learn", "settings"] as const;

const Index = () => {
  const { user, loading, isConfigured } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  // Show loading state briefly
  if (loading) {
    return (
      <div style={{
        height: "100dvh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column", gap: 12,
      }}>
        <div style={{ fontSize: 36 }}>🌙</div>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading Liyan AI…</p>
      </div>
    );
  }

  // Show auth screen if Supabase is configured but user not signed in
  if (isConfigured && !user) {
    return <AuthScreen />;
  }

  const navigate = (screen: string, data?: any) => {
    if ((TABS as readonly string[]).includes(screen)) {
      setActiveTab(screen);
      setSubScreen(null);
    } else if (screen === "quiz") {
      setSubScreen({ type: "quiz", difficulty: data?.difficulty ?? "easy" });
    } else if (screen === "saved") {
      setSubScreen({ type: "saved" });
    }
  };

  const goBack = () => setSubScreen(null);

  const renderContent = () => {
    if (subScreen?.type === "quiz") {
      return <QuizScreen difficulty={subScreen.difficulty} onBack={goBack} />;
    }
    if (subScreen?.type === "saved") {
      return <SavedScreen />;
    }
    switch (activeTab) {
      case "home": return <HomeScreen onNavigate={navigate} />;
      case "recite": return <ReciteScreen />;
      case "chat": return <ChatScreen />;
      case "learn": return <LearnScreen />;
      case "settings": return <SettingsScreen onNavigate={navigate} />;
      default: return <ChatScreen />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen" style={{ background: "var(--bg)" }}>
      <AmbientBackground />
      <div
        className="w-full max-w-[430px] relative flex flex-col"
        style={{ minHeight: "100dvh", background: "transparent", zIndex: 1 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={subScreen ? `sub-${subScreen.type}` : activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex-1"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>

        {!subScreen && (
          <BottomTabs activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSubScreen(null); }} />
        )}
      </div>
    </div>
  );
};

export default Index;
