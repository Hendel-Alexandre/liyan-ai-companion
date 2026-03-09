import {
    createContext, useCallback, useContext, useEffect, useState, type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    listConversations, createConversation, updateConversationTitle,
    touchConversation, deleteConversation, clearAllConversations,
    type DbConversation,
} from '@/repositories/conversationRepository';
import {
    listMessages, insertMessage, type DbMessage,
} from '@/repositories/messageRepository';
import { runMigrationIfNeeded } from '@/utils/localStorageMigration';

/* ── Local-compatible types ──────────────────────────── */
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'error';
    content: string;
    timestamp: number;
    provider_used?: string;
}

export interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    createdAt: number;
    updatedAt: number;
}

interface ChatContextValue {
    conversations: Conversation[];
    activeId: string | null;
    setActiveId: (id: string | null) => void;
    startConversation: () => Promise<Conversation>;
    addMessage: (conversationId: string, msg: Omit<Message, 'id' | 'timestamp'>) => Promise<void>;
    updateTitle: (conversationId: string, title: string) => Promise<void>;
    deleteConversation: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
    getActive: () => Conversation | null;
    loadMessages: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue>({
    conversations: [], activeId: null,
    setActiveId: () => { },
    startConversation: async () => ({ id: '', title: '', messages: [], createdAt: 0, updatedAt: 0 }),
    addMessage: async () => { },
    updateTitle: async () => { },
    deleteConversation: async () => { },
    clearAll: async () => { },
    getActive: () => null,
    loadMessages: async () => { },
});

const LS_KEY = 'liyan-conversations';

function fromDbConversation(c: DbConversation): Conversation {
    return {
        id: c.id, title: c.title,
        messages: [],
        createdAt: new Date(c.created_at).getTime(),
        updatedAt: new Date(c.last_message_at).getTime(),
    };
}

function fromDbMessage(m: DbMessage): Message {
    return {
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.created_at).getTime(),
        provider_used: m.provider_used ?? undefined,
    };
}

/* ── localStorage fallback (unauthenticated) ─────────── */
function lsLoad(): Conversation[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function lsSave(convs: Conversation[]) {
    localStorage.setItem(LS_KEY, JSON.stringify(convs));
}

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [migrated, setMigrated] = useState(false);

    // Load conversations from Supabase (or localStorage fallback)
    useEffect(() => {
        if (user) {
            // Run migration once then load from Supabase
            if (!migrated) {
                runMigrationIfNeeded(user.id).then(() => setMigrated(true));
            }
            listConversations(user.id).then(dbConvs => {
                setConversations(dbConvs.map(fromDbConversation));
            });
        } else {
            setConversations(lsLoad());
        }
    }, [user?.id]);

    const loadMessages = useCallback(async (conversationId: string) => {
        if (user) {
            const dbMsgs = await listMessages(conversationId);
            setConversations(prev => prev.map(c =>
                c.id === conversationId ? { ...c, messages: dbMsgs.map(fromDbMessage) } : c
            ));
        }
    }, [user]);

    const startConversation = useCallback(async (): Promise<Conversation> => {
        if (user) {
            const dbConv = await createConversation(user.id);
            if (dbConv) {
                const conv = fromDbConversation(dbConv);
                setConversations(prev => [conv, ...prev]);
                setActiveId(conv.id);
                return conv;
            }
        }
        // localStorage fallback
        const conv: Conversation = {
            id: crypto.randomUUID(), title: 'New conversation',
            messages: [], createdAt: Date.now(), updatedAt: Date.now(),
        };
        setConversations(prev => { const next = [conv, ...prev]; lsSave(next); return next; });
        setActiveId(conv.id);
        return conv;
    }, [user]);

    const addMessage = useCallback(async (
        conversationId: string,
        msg: Omit<Message, 'id' | 'timestamp'>,
    ) => {
        const newMsg: Message = { ...msg, id: crypto.randomUUID(), timestamp: Date.now() };

        // Optimistic UI update
        setConversations(prev => prev.map(c => {
            if (c.id !== conversationId) return c;
            const messages = [...c.messages, newMsg];
            const title = messages[0]?.role === 'user' && c.title === 'New conversation'
                ? messages[0].content.slice(0, 50) + (messages[0].content.length > 50 ? '…' : '')
                : c.title;
            return { ...c, messages, title, updatedAt: Date.now() };
        }));

        if (user) {
            await insertMessage({
                conversation_id: conversationId,
                user_id: user.id,
                role: msg.role === 'error' ? 'assistant' : msg.role,
                content: msg.content,
                provider_used: msg.provider_used,
            });
            // Auto-title
            const conv = conversations.find(c => c.id === conversationId);
            if (conv?.title === 'New conversation' && msg.role === 'user') {
                const title = msg.content.slice(0, 50) + (msg.content.length > 50 ? '…' : '');
                await updateConversationTitle(conversationId, title);
            }
            await touchConversation(conversationId, msg.provider_used);
        } else {
            setConversations(prev => { const next = [...prev]; lsSave(next); return next; });
        }
    }, [user, conversations]);

    const updateTitle = useCallback(async (conversationId: string, title: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, title } : c));
        if (user) await updateConversationTitle(conversationId, title);
        else setConversations(prev => { lsSave(prev); return prev; });
    }, [user]);

    const deleteConv = useCallback(async (id: string) => {
        setConversations(prev => { const next = prev.filter(c => c.id !== id); lsSave(next); return next; });
        setActiveId(a => a === id ? null : a);
        if (user) await deleteConversation(id);
    }, [user]);

    const clearAll = useCallback(async () => {
        setConversations([]);
        setActiveId(null);
        lsSave([]);
        if (user) await clearAllConversations(user.id);
    }, [user]);

    const getActive = useCallback(() =>
        conversations.find(c => c.id === activeId) ?? null
        , [conversations, activeId]);

    return (
        <ChatContext.Provider value={{
            conversations, activeId, setActiveId,
            startConversation, addMessage, updateTitle,
            deleteConversation: deleteConv, clearAll, getActive, loadMessages,
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
