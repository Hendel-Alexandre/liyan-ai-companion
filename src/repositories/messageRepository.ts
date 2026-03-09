import { api } from '@/lib/api';

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
    try { return await api.chat.listMessages(conversationId); }
    catch (err) { console.warn('[msgRepo] list:', err); return []; }
}

export async function insertMessage(
    msg: Pick<DbMessage, 'conversation_id' | 'user_id' | 'role' | 'content'> & {
        provider_used?: string;
        metadata_json?: Record<string, any>;
    }
): Promise<DbMessage | null> {
    try {
        return await api.chat.insertMessage(msg.conversation_id, {
            role: msg.role,
            content: msg.content,
            provider_used: msg.provider_used,
            metadata_json: msg.metadata_json,
        });
    } catch (err) { console.warn('[msgRepo] insert:', err); return null; }
}

export async function bulkInsertMessages(messages: Omit<DbMessage, 'id' | 'created_at'>[]) {
    for (const msg of messages) {
        await insertMessage(msg);
    }
}
