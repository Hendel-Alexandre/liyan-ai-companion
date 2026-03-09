import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme, type ThemeName, THEME_META } from '@/context/ThemeContext';
import { useSettings, type TextSize, type VoiceSpeed, type VoiceGender } from '@/context/SettingsContext';
import { useChat } from '@/context/ChatContext';
import { useSaved } from '@/context/SavedContext';

interface Props { onNavigate?: (tab: string) => void; }

/* ─── segmented control ─── */
const Seg = ({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) => (
    <div style={{ display: 'flex', gap: 3, padding: 3, background: 'var(--surface2)', borderRadius: 10 }}>
        {options.map(o => (
            <button key={o} onClick={() => onChange(o)}
                style={{ flex: 1, padding: '7px 4px', fontSize: 12, fontWeight: value === o ? 600 : 400, background: value === o ? 'var(--accent)' : 'transparent', color: value === o ? 'var(--accent-text)' : 'var(--text-muted)', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.15s' }}>
                {o}
            </button>
        ))}
    </div>
);

/* ─── row ─── */
const Row = ({ label, right, destructive, noBorder, onClick }: {
    label: string; right?: React.ReactNode; destructive?: boolean; noBorder?: boolean; onClick?: () => void;
}) => (
    <button onClick={onClick} style={{ width: '100%', minHeight: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', background: 'transparent', border: 'none', borderBottom: noBorder ? 'none' : '1px solid var(--border)', cursor: onClick ? 'pointer' : 'default', textAlign: 'left' }}>
        <span style={{ fontSize: 15, color: destructive ? '#EF4444' : 'var(--text)' }}>{label}</span>
        {right && <div style={{ color: 'var(--text-muted)', fontSize: 15 }}>{right}</div>}
    </button>
);

/* ─── section header ─── */
const SH = ({ t }: { t: string }) => (
    <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '20px 4px 8px' }}>{t}</p>
);

/* ─── card container ─── */
const Card = ({ children }: { children: React.ReactNode }) => (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
        {children}
    </div>
);

const THEMES: { id: ThemeName }[] = [
    { id: 'lime' }, { id: 'purple' }, { id: 'green' }, { id: 'pink' }, { id: 'blue' },
];

const SettingsScreen = ({ onNavigate }: Props) => {
    const { theme, setTheme } = useTheme();
    const { textSize, voiceSpeed, voiceGender, userName, setTextSize, setVoiceSpeed, setVoiceGender, setUserName } = useSettings();
    const { clearAll: clearChats } = useChat();
    const { clearAll: clearSaved } = useSaved();
    const [confirm, setConfirm] = useState(false);
    const [cleared, setCleared] = useState(false);

    const clearHistory = () => {
        if (confirm) {
            clearChats();
            clearSaved();
            setConfirm(false);
            setCleared(true);
            setTimeout(() => setCleared(false), 2000);
        } else {
            setConfirm(true);
            setTimeout(() => setConfirm(false), 4000);
        }
    };

    return (
        <div style={{
            height: '100dvh',
            background: 'var(--bg)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            padding: `max(1.2rem, env(safe-area-inset-top)) 16px calc(88px + max(0px, env(safe-area-inset-bottom)))`,
        }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 2 }}>Settings</h1>

            {/* Appearance */}
            <SH t="Appearance" />
            <Card>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 14 }}>Accent Color</p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        {THEMES.map(({ id }) => (
                            <button key={id} onClick={() => setTheme(id)}
                                style={{ width: 40, height: 40, borderRadius: '50%', background: THEME_META[id].accent, border: theme === id ? '3px solid rgba(255,255,255,0.9)' : '2px solid transparent', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'border 0.2s' }}>
                                {theme === id && <Check size={16} strokeWidth={2.5} style={{ color: '#000' }} />}
                            </button>
                        ))}
                    </div>
                </div>
                <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Text Size</p>
                    <Seg
                        options={['Small', 'Medium', 'Large']}
                        value={textSize === 'small' ? 'Small' : textSize === 'large' ? 'Large' : 'Medium'}
                        onChange={v => setTextSize(v.toLowerCase() as TextSize)}
                    />
                </div>
            </Card>

            {/* Voice */}
            <SH t="Voice" />
            <Card>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Voice Speed</p>
                    <Seg
                        options={['Slow', 'Normal', 'Fast']}
                        value={voiceSpeed === 'slow' ? 'Slow' : voiceSpeed === 'fast' ? 'Fast' : 'Normal'}
                        onChange={v => setVoiceSpeed(v.toLowerCase() as VoiceSpeed)}
                    />
                </div>
                <div style={{ padding: '14px 16px' }}>
                    <p style={{ fontSize: 14, color: 'var(--text)', marginBottom: 10 }}>Voice Gender</p>
                    <Seg
                        options={['Feminine', 'Masculine']}
                        value={voiceGender === 'masculine' ? 'Masculine' : 'Feminine'}
                        onChange={v => setVoiceGender(v.toLowerCase() as VoiceGender)}
                    />
                </div>
            </Card>

            {/* Account */}
            <SH t="Account" />
            <Card>
                <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Your Name</p>
                    <input type="text" value={userName} placeholder="Enter your name"
                        onChange={e => setUserName(e.target.value)}
                        style={{ width: '100%', fontSize: 15, background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border-strong)', borderRadius: 12, padding: '10px 14px', outline: 'none' }}
                    />
                </div>
                {cleared ? (
                    <div style={{ padding: '14px 16px', color: '#4ADE80', fontSize: 14 }}>✓ History cleared</div>
                ) : (
                    <Row
                        label={confirm ? '⚠ Tap again to confirm — cannot be undone' : 'Clear All History'}
                        destructive noBorder onClick={clearHistory}
                    />
                )}
            </Card>

            {/* Library */}
            <SH t="Library" />
            <Card>
                <Row label="Saved Items" noBorder right="›" onClick={() => onNavigate?.('saved')} />
            </Card>

            {/* About */}
            <SH t="About" />
            <Card>
                <Row label="Version" right={<span style={{ fontSize: 13 }}>1.0.0</span>} />
                <Row label="Send Feedback" noBorder right="›" onClick={() => window.open('mailto:feedback@liyan.ai', '_blank')} />
            </Card>

            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: '24px 0 8px', lineHeight: 1.7, opacity: 0.8 }}>
                Liyan AI is not a substitute for qualified Islamic scholarship.
            </p>
        </div>
    );
};

export default SettingsScreen;
