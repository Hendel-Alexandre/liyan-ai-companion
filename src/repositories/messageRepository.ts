import { supabase } from '@/lib/supabaseClient';

export interface DbMessage {
    id: string;
    conversation_id: string;
    user_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    citations_json?: any[];
    provider_used?: string | null;
    metadata_json?: Record<string, any>;
    created_at: string;
}

export async function listMessages(conversationId: string): Promise<DbMessage[]> {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
    if (error) { console.warn('[msgRepo] list:', error.message); return []; }
    return (data ?? []) as DbMessage[];
}

export async function insertMessage(
    msg: Pick<DbMessage, 'conversation_id' | 'user_id' | 'role' | 'content'> & {
        provider_used?: string;
        metadata_json?: Record<string, any>;
    }
): Promise<DbMessage | null> {
    const { data, error } = await supabase
        .from('messages')
        .insert(msg)
        .select('*')
        .single();
    if (error) { console.warn('[msgRepo] insert:', error.message); return null; }
    return data as DbMessage;
}

export async function bulkInsertMessages(messages: Omit<DbMessage, 'id' | 'created_at'>[]) {
    const { error } = await supabase.from('messages').insert(messages);
    if (error) console.warn('[msgRepo] bulkInsert:', error.message);
}
