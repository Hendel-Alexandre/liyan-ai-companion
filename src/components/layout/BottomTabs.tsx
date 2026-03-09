import { Home, BookOpen, GraduationCap, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'home', Icon: Home, label: 'Home' },
  { id: 'recite', Icon: BookOpen, label: 'Recite' },
  { id: '__orb__', Icon: null, label: '' }, // center orb
  { id: 'learn', Icon: GraduationCap, label: 'Learn' },
  { id: 'settings', Icon: Settings, label: 'Settings' },
];

export const BottomTabs = ({ activeTab, onTabChange }: Props) => (
  <div style={{
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 430,
    zIndex: 50,
    padding: '0 16px max(12px, env(safe-area-inset-bottom)) 16px',
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderTop: '1px solid rgba(0,0,0,0.08)',
  }}>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 56 }}>
      {TABS.map(tab => {
        if (tab.id === '__orb__') {
          /* ── CENTER ORB ── */
          return (
            <motion.button
              key="orb"
              whileTap={{ scale: 0.92 }}
              onClick={() => onTabChange('chat')}
              style={{
                width: 68,
                height: 68,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'translateY(-12px)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Chat"
            >
              <div
                className={`orb${activeTab === 'chat' ? ' orb-listening' : ''}`}
                style={{ width: 54, height: 54 }}
              />
            </motion.button>
          );
        }

        const { Icon } = tab;
        const isActive = activeTab === tab.id;

        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.9 }}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              height: 56,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              minWidth: 0,
            }}
          >
            {Icon && (
              <Icon
                size={22}
                strokeWidth={1.5}
                style={{
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  transition: 'color 0.18s',
                }}
              />
            )}
            <span style={{
              fontSize: 10,
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent)' : 'var(--text-muted)',
              transition: 'color 0.18s',
              letterSpacing: '0.02em',
            }}>
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default BottomTabs;
