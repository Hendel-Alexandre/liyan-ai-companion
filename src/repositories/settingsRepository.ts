import { api } from '@/lib/api';

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
    created_at?: string;
    updated_at?: string;
}

export async function getSettings(_userId: string): Promise<DbSettings | null> {
    try { return await api.user.getSettings(); }
    catch (err) { console.warn('[settingsRepo] get:', err); return null; }
}

export async function upsertSettings(_userId: string, settings: Partial<Omit<DbSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) {
    try { await api.user.upsertSettings(settings); }
    catch (err) { console.warn('[settingsRepo] upsert:', err); }
}
