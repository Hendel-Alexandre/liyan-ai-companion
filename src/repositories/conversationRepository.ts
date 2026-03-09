import { api } from '@/lib/api';

export interface DbConversation {
    id: string;
    user_id: string;
    title: string;
    provider_last_used?: string | null;
    created_at: string;
    updated_at: string;
    last_message_at: string;
}

export async function listConversations(_userId: string): Promise<DbConversation[]> {
    try { return await api.chat.listConversations(); }
    catch (err) { console.warn('[convRepo] list:', err); return []; }
}

export async function createConversation(_userId: string, title = 'New conversation'): Promise<DbConversation | null> {
    try { return await api.chat.createConversation(title); }
    catch (err) { console.warn('[convRepo] create:', err); return null; }
}

export async function updateConversationTitle(conversationId: string, title: string) {
    try { await api.chat.updateConversation(conversationId, { title }); }
    catch (err) { console.warn('[convRepo] updateTitle:', err); }
}

export async function touchConversation(conversationId: string, providerUsed?: string) {
    try { await api.chat.updateConversation(conversationId, { provider_last_used: providerUsed }); }
    catch (err) { console.warn('[convRepo] touch:', err); }
}

export async function deleteConversation(conversationId: string) {
    try { await api.chat.deleteConversation(conversationId); }
    catch (err) { console.warn('[convRepo] delete:', err); }
}

export async function clearAllConversations(_userId: string) {
    try { await api.chat.clearConversations(); }
    catch (err) { console.warn('[convRepo] clearAll:', err); }
}
