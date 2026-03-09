/**
 * localStorage → Supabase one-time migration.
 * Runs once per user on first authenticated session.
 * After migration, Supabase is the source of truth.
 */
import { supabase } from '@/lib/supabaseClient';

const MIGRATION_KEY = 'liyan_migrated_to_supabase';

export function isMigrated(): boolean {
    return localStorage.getItem(MIGRATION_KEY) === 'true';
}

function markMigrated() {
    localStorage.setItem(MIGRATION_KEY, 'true');
}

/* ── Conversations + messages ─────────────────────── */
async function migrateChats(userId: string) {
    try {
        const raw = localStorage.getItem('liyan-conversations');
        if (!raw) return;
        const convs: any[] = JSON.parse(raw);
        if (!convs.length) return;

        // Only migrate if DB has no conversations yet
        const { count } = await supabase
            .from('conversations')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
        if ((count ?? 0) > 0) return;

        for (const conv of convs) {
            const { data: newConv, error } = await supabase
                .from('conversations')
                .insert({
                    user_id: userId,
                    title: conv.title || 'Imported conversation',
                    created_at: conv.createdAt ? new Date(conv.createdAt).toISOString() : undefined,
                    last_message_at: conv.updatedAt ? new Date(conv.updatedAt).toISOString() : undefined,
                })
                .select('id')
                .single();
            if (error || !newConv) continue;

            const messages = (conv.messages || []).map((m: any) => ({
                conversation_id: newConv.id,
                user_id: userId,
                role: m.role,
                content: m.content,
                created_at: m.timestamp ? new Date(m.timestamp).toISOString() : undefined,
            }));
            if (messages.length) {
                await supabase.from('messages').insert(messages);
            }
        }
        console.info('[migration] Conversations migrated from localStorage');
    } catch (err) {
        console.warn('[migration] Chat migration failed:', err);
    }
}

/* ── Settings ─────────────────────────────────────── */
async function migrateSettings(userId: string) {
    try {
        const raw = localStorage.getItem('liyan_settings');
        if (!raw) return;
        const s: any = JSON.parse(raw);

        await supabase.from('user_settings').upsert({
            user_id: userId,
            text_size: s.textSize || 'medium',
            voice_speed: s.voiceSpeed || 'normal',
            voice_gender: s.voiceGender || 'feminine',
        }, { onConflict: 'user_id' });

        if (s.userName) {
            await supabase.from('profiles').upsert(
                { id: userId, name: s.userName },
                { onConflict: 'id' }
            );
        }
        console.info('[migration] Settings migrated from localStorage');
    } catch (err) {
        console.warn('[migration] Settings migration failed:', err);
    }
}

/* ── Saved items ──────────────────────────────────── */
async function migrateSavedItems(userId: string) {
    try {
        const raw = localStorage.getItem('liyan-saved');
        if (!raw) return;
        const items: any[] = JSON.parse(raw);
        if (!items.length) return;

        const { count } = await supabase
            .from('saved_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);
        if ((count ?? 0) > 0) return;

        const categoryMap: Record<string, string> = {
            Chats: 'chat', Duas: 'dua', Prayer: 'prayer_guide', Recitations: 'recitation',
        };

        const rows = items.map((item: any) => ({
            user_id: userId,
            item_type: categoryMap[item.category] || 'chat',
            title: item.title,
            subtitle: item.snippet || '',
            payload_json: { fullContent: item.fullContent },
            created_at: item.timestamp ? new Date(item.timestamp).toISOString() : undefined,
        }));
        await supabase.from('saved_items').insert(rows);
        console.info('[migration] Saved items migrated from localStorage');
    } catch (err) {
        console.warn('[migration] Saved items migration failed:', err);
    }
}

/* ── Main entry point ─────────────────────────────── */
export async function runMigrationIfNeeded(userId: string) {
    if (isMigrated()) return;
    await Promise.all([
        migrateChats(userId),
        migrateSettings(userId),
        migrateSavedItems(userId),
    ]);
    markMigrated();
    console.info('[migration] localStorage → Supabase migration complete');
}
