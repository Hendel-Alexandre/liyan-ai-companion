import { Clock, MessageSquare, BookOpen, Moon, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChat } from '@/context/ChatContext';
import { useSaved } from '@/context/SavedContext';

const CATEGORY_ICON: Record<string, any> = {
    Chats: MessageSquare,
    Duas: Moon,
    Prayer: Moon,
    Recitations: BookOpen,
};
const CATEGORY_COLOR: Record<string, string> = {
    Chats: 'var(--accent)',
    Duas: '#A78BFA',
    Prayer: '#60A5FA',
    Recitations: '#F472B6',
};

function timeAgo(ts: number): string {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

interface Props {
    onNavigate: (tab: string) => void;
}

export const RecentActivityWidget = ({ onNavigate }: Props) => {
    const { conversations } = useChat();
    const { items } = useSaved();

    // Merge recent chats + saved items, sort by time, show top 4
    const chatEntries = conversations.slice(0, 2).map(c => ({
        id: `chat-${c.id}`,
        label: c.title,
        time: c.updatedAt,
        category: 'Chats' as const,
        tab: 'chat',
    }));

    const savedEntries = items.slice(0, 3).map(i => ({
        id: i.id,
        label: i.title,
        time: i.timestamp,
        category: i.category,
        tab: 'settings',
    }));

    const allEntries = [...chatEntries, ...savedEntries]
        .sort((a, b) => b.time - a.time)
        .slice(0, 4);

    if (allEntries.length === 0) {
        return (
            <div className="card w-full" style={{ padding: '16px' }}>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Recent</p>
                <div style={{ padding: '20px 0', textAlign: 'center' }}>
                    <Clock size={24} strokeWidth={1.5} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your recent activity will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card w-full" style={{ padding: '16px' }}>
            <div className="flex items-center justify-between mb-3">
                <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recent</p>
                <button onClick={() => onNavigate('settings')} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>See all</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allEntries.map(entry => {
                    const Icon = CATEGORY_ICON[entry.category] || Clock;
                    return (
                        <motion.button
                            key={entry.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onNavigate(entry.tab)}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', textAlign: 'left', width: '100%' }}
                        >
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLOR[entry.category] || 'var(--accent)', flexShrink: 0 }} />
                            <p style={{ flex: 1, fontSize: 14, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.label}</p>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{timeAgo(entry.time)}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};
