import { api } from '@/lib/api';

export interface DbProfile {
    id: string;
    name: string;
    email?: string;
    created_at?: string;
}

export async function getProfile(_userId: string): Promise<DbProfile | null> {
    try { return await api.user.getProfile(); }
    catch (err) { console.warn('[profileRepo] get:', err); return null; }
}

export async function updateProfile(_userId: string, patch: { name: string }) {
    try { await api.user.updateProfile(patch); }
    catch (err) { console.warn('[profileRepo] update:', err); }
}
