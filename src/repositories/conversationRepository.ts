import { supabase } from '@/lib/supabaseClient';

export interface DbConversation {
    id: string;
    user_id: string;
    title: string;
    provider_last_used?: string | null;
    created_at: string;
    updated_at: string;
    last_message_at: string;
}

export async function listConversations(userId: string): Promise<DbConversation[]> {
    const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });
    if (error) { console.warn('[convRepo] list:', error.message); return []; }
    return (data ?? []) as DbConversation[];
}

export async function createConversation(userId: string, title = 'New conversation'): Promise<DbConversation | null> {
    const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title })
        .select('*')
        .single();
    if (error) { console.warn('[convRepo] create:', error.message); return null; }
    return data as DbConversation;
}

export async function updateConversationTitle(conversationId: string, title: string) {
    const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);
    if (error) console.warn('[convRepo] updateTitle:', error.message);
}

export async function touchConversation(conversationId: string, providerUsed?: string) {
    const { error } = await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString(), provider_last_used: providerUsed ?? null })
        .eq('id', conversationId);
    if (error) console.warn('[convRepo] touch:', error.message);
}

export async function deleteConversation(conversationId: string) {
    const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
    if (error) console.warn('[convRepo] delete:', error.message);
}

export async function clearAllConversations(userId: string) {
    const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', userId);
    if (error) console.warn('[convRepo] clearAll:', error.message);
}
