import { supabase } from '@/lib/supabaseClient';
import { upsertSettings } from '@/repositories/settingsRepository';

/** Called once on SIGNED_IN — creates profile and default settings rows if absent */
export async function bootstrapUser(userId: string, email?: string | null) {
    try {
        // 1. Upsert profile
        await supabase.from('profiles').upsert(
            { id: userId, name: email?.split('@')[0] ?? '' },
            { onConflict: 'id' }
        );

        // 2. Upsert default settings (only if not already present)
        const { data: existing } = await supabase
            .from('user_settings')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        if (!existing) {
            await upsertSettings(userId, {
                accent_color: 'lime',
                text_size: 'medium',
                voice_speed: 'normal',
                voice_gender: 'feminine',
                voice_provider: 'browser',
            });
        }
    } catch (err) {
        console.error('[authService] bootstrap error:', err);
    }
}

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

export async function getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
}
