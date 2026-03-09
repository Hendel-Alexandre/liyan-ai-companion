import { MessageCircle, BookOpen, Moon, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "recite", label: "Recite", icon: BookOpen },
  { id: "prayer", label: "Prayer", icon: Moon },
  { id: "saved", label: "Saved", icon: Bookmark },
];

const BottomTabs = ({ activeTab, onTabChange }: BottomTabsProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-[430px] bg-background/90 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="flex flex-col items-center gap-1 px-4 py-1.5 transition-colors duration-200"
              >
                <Icon
                  size={22}
                  strokeWidth={1.5}
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-lime" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[11px] font-outfit font-medium transition-colors duration-200",
                    isActive ? "text-lime" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomTabs;
