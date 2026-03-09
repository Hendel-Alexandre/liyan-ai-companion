import { api } from '@/lib/api';

export type SavedItemType = 'chat' | 'ayah' | 'dua' | 'recitation' | 'prayer_guide' | 'quran_match';

export interface DbSavedItem {
    id: string;
    user_id: string;
    item_type: SavedItemType;
    item_ref_id?: string | null;
    title: string;
    subtitle?: string | null;
    payload_json?: Record<string, any>;
    created_at: string;
}

export async function listSavedItems(_userId: string): Promise<DbSavedItem[]> {
    try { return await api.user.listSaved(); }
    catch (err) { console.warn('[savedRepo] list:', err); return []; }
}

export async function addSavedItem(
    _userId: string,
    item: {
        item_type: SavedItemType;
        title: string;
        subtitle?: string;
        item_ref_id?: string;
        payload_json?: Record<string, any>;
    }
): Promise<DbSavedItem | null> {
    try { return await api.user.addSaved(item); }
    catch (err) { console.warn('[savedRepo] add:', err); return null; }
}

export async function removeSavedItem(itemId: string) {
    try { await api.user.removeSaved(itemId); }
    catch (err) { console.warn('[savedRepo] remove:', err); }
}

export async function clearAllSavedItems(_userId: string) {
    try { await api.user.clearSaved(); }
    catch (err) { console.warn('[savedRepo] clearAll:', err); }
}
