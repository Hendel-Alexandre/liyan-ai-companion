import { api } from '@/lib/api';

export async function bootstrapUser(_userId: string, _email?: string | null) {
    // Settings are auto-created on signup via server
}

export async function getCurrentUser() {
    try {
        const { user } = await api.auth.me();
        return user;
    } catch {
        return null;
    }
}

export async function getAccessToken(): Promise<string | null> {
    return localStorage.getItem('liyan_token');
}
