import {
    createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    listSavedItems, addSavedItem, removeSavedItem, clearAllSavedItems,
    type DbSavedItem, type SavedItemType,
} from '@/repositories/savedItemsRepository';

export interface SavedItem {
    id: string;
    title: string;
    snippet: string;
    category: 'Chats' | 'Duas' | 'Prayer' | 'Recitations';
    timestamp: number;
    fullContent?: string;
}

interface SavedContextValue {
    items: SavedItem[];
    addItem: (item: Omit<SavedItem, 'id' | 'timestamp'>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

const SavedContext = createContext<SavedContextValue>({
    items: [],
    addItem: async () => { },
    removeItem: async () => { },
    clearAll: async () => { },
});

const LS_KEY = 'liyan-saved';
const CATEGORY_TO_TYPE: Record<string, SavedItemType> = {
    Chats: 'chat', Duas: 'dua', Prayer: 'prayer_guide', Recitations: 'recitation',
};
const TYPE_TO_CATEGORY: Record<string, SavedItem['category']> = {
    chat: 'Chats', dua: 'Duas', prayer_guide: 'Prayer', recitation: 'Recitations', quran_match: 'Recitations', ayah: 'Duas',
};

function fromDb(d: DbSavedItem): SavedItem {
    return {
        id: d.id,
        title: d.title,
        snippet: d.subtitle ?? '',
        category: TYPE_TO_CATEGORY[d.item_type] ?? 'Chats',
        timestamp: new Date(d.created_at).getTime(),
        fullContent: (d.payload_json as any)?.fullContent,
    };
}

function lsLoad(): SavedItem[] {
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}

export const SavedProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<SavedItem[]>(lsLoad);

    useEffect(() => {
        if (!user) return;
        listSavedItems(user.id).then(dbItems => setItems(dbItems.map(fromDb)));
    }, [user?.id]);

    const addItem = useCallback(async (item: Omit<SavedItem, 'id' | 'timestamp'>) => {
        if (user) {
            const dbItem = await addSavedItem(user.id, {
                item_type: CATEGORY_TO_TYPE[item.category] ?? 'chat',
                title: item.title,
                subtitle: item.snippet,
                payload_json: { fullContent: item.fullContent },
            });
            if (dbItem) {
                setItems(prev => [fromDb(dbItem), ...prev]);
                return;
            }
        }
        // localStorage fallback
        const newItem: SavedItem = { ...item, id: crypto.randomUUID(), timestamp: Date.now() };
        setItems(prev => {
            const next = [newItem, ...prev];
            localStorage.setItem(LS_KEY, JSON.stringify(next));
            return next;
        });
    }, [user]);

    const removeItem = useCallback(async (id: string) => {
        setItems(prev => {
            const next = prev.filter(i => i.id !== id);
            localStorage.setItem(LS_KEY, JSON.stringify(next));
            return next;
        });
        if (user) await removeSavedItem(id);
    }, [user]);

    const clearAll = useCallback(async () => {
        setItems([]);
        localStorage.setItem(LS_KEY, '[]');
        if (user) await clearAllSavedItems(user.id);
    }, [user]);

    return (
        <SavedContext.Provider value={{ items, addItem, removeItem, clearAll }}>
            {children}
        </SavedContext.Provider>
    );
};

export const useSaved = () => useContext(SavedContext);
