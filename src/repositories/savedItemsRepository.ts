import { supabase } from '@/lib/supabaseClient';

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

export async function listSavedItems(userId: string): Promise<DbSavedItem[]> {
    const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) { console.warn('[savedRepo] list:', error.message); return []; }
    return (data ?? []) as DbSavedItem[];
}

export async function addSavedItem(
    userId: string,
    item: {
        item_type: SavedItemType;
        title: string;
        subtitle?: string;
        item_ref_id?: string;
        payload_json?: Record<string, any>;
    }
): Promise<DbSavedItem | null> {
    const { data, error } = await supabase
        .from('saved_items')
        .insert({ user_id: userId, ...item })
        .select('*')
        .single();
    if (error) { console.warn('[savedRepo] add:', error.message); return null; }
    return data as DbSavedItem;
}

export async function removeSavedItem(itemId: string) {
    const { error } = await supabase.from('saved_items').delete().eq('id', itemId);
    if (error) console.warn('[savedRepo] remove:', error.message);
}

export async function clearAllSavedItems(userId: string) {
    const { error } = await supabase.from('saved_items').delete().eq('user_id', userId);
    if (error) console.warn('[savedRepo] clearAll:', error.message);
}
