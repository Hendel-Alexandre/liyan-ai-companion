import { supabase } from '@/lib/supabaseClient';

export interface DbProfile {
    id: string;
    name: string | null;
    avatar_url: string | null;
}

export async function getProfile(userId: string): Promise<DbProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .eq('id', userId)
        .maybeSingle();
    if (error) { console.warn('[profileRepo] get:', error.message); return null; }
    return data as DbProfile;
}

export async function updateProfile(userId: string, patch: { name?: string; avatar_url?: string }) {
    const { error } = await supabase
        .from('profiles')
        .update(patch)
        .eq('id', userId);
    if (error) console.warn('[profileRepo] update:', error.message);
}
