import { supabase } from '@/lib/supabaseClient';

export interface DbSettings {
    id?: string;
    user_id: string;
    accent_color: string;
    text_size: 'small' | 'medium' | 'large';
    voice_speed: 'slow' | 'normal' | 'fast';
    voice_gender: 'feminine' | 'masculine';
    voice_provider?: string;
    voice_id?: string;
    city?: string;
    country?: string;
}

export async function getSettings(userId: string): Promise<DbSettings | null> {
    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
    if (error) { console.warn('[settingsRepo] get:', error.message); return null; }
    return data as DbSettings;
}

export async function upsertSettings(
    userId: string,
    patch: Partial<Omit<DbSettings, 'id' | 'user_id'>>
): Promise<void> {
    const { error } = await supabase.from('user_settings').upsert(
        { user_id: userId, ...patch },
        { onConflict: 'user_id' }
    );
    if (error) console.warn('[settingsRepo] upsert:', error.message);
}
