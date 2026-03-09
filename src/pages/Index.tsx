import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomTabs from "@/components/layout/BottomTabs";
import HomeScreen from "./HomeScreen";
import ChatScreen from "./ChatScreen";
import ReciteScreen from "./ReciteScreen";
import PrayerScreen from "./PrayerScreen";
import SavedScreen from "./SavedScreen";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  const [showVoiceChat, setShowVoiceChat] = useState(false);

  const handleNavigate = (tab: string) => {
    if (tab === "voice") {
      setShowVoiceChat(true);
    } else {
      setShowVoiceChat(false);
      setActiveTab(tab);
    }
  };

  const renderScreen = () => {
    if (showVoiceChat) return <ChatScreen />;
    switch (activeTab) {
      case "chat":
        return <HomeScreen onNavigate={handleNavigate} />;
      case "recite":
        return <ReciteScreen />;
      case "prayer":
        return <PrayerScreen />;
      case "saved":
        return <SavedScreen />;
      default:
        return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-background">
      <div className="w-full max-w-[430px] relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
        <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default Index;
