const BASE = '/api';

function getToken(): string | null {
    return localStorage.getItem('liyan_token');
}

function authHeaders(): HeadersInit {
    const token = getToken();
    return token
        ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        : { 'Content-Type': 'application/json' };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error || `HTTP ${res.status}`);
    }
    return res.json();
}

export const api = {
    auth: {
        signup: (email: string, password: string, name?: string) =>
            request<{ token: string; user: { id: string; email: string; name: string } }>(
                '/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) }
            ),
        signin: (email: string, password: string) =>
            request<{ token: string; user: { id: string; email: string; name: string } }>(
                '/auth/signin', { method: 'POST', body: JSON.stringify({ email, password }) }
            ),
        me: () =>
            request<{ user: { id: string; email: string; name: string } }>('/auth/me'),
    },

    chat: {
        completion: (message: string, history: { role: string; content: string }[], primary_provider = 'claude') =>
            request<{ text: string; provider_used: string }>(
                '/chat/completion', { method: 'POST', body: JSON.stringify({ message, history, primary_provider }) }
            ),
        listConversations: () =>
            request<any[]>('/chat/conversations'),
        createConversation: (title?: string) =>
            request<any>('/chat/conversations', { method: 'POST', body: JSON.stringify({ title }) }),
        updateConversation: (id: string, patch: { title?: string; provider_last_used?: string }) =>
            request<{ ok: boolean }>(`/chat/conversations/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
        deleteConversation: (id: string) =>
            request<{ ok: boolean }>(`/chat/conversations/${id}`, { method: 'DELETE' }),
        clearConversations: () =>
            request<{ ok: boolean }>('/chat/conversations', { method: 'DELETE' }),
        listMessages: (conversationId: string) =>
            request<any[]>(`/chat/conversations/${conversationId}/messages`),
        insertMessage: (conversationId: string, msg: { role: string; content: string; provider_used?: string; metadata_json?: any }) =>
            request<any>(`/chat/conversations/${conversationId}/messages`, { method: 'POST', body: JSON.stringify(msg) }),
    },

    user: {
        getSettings: () => request<any>('/user/settings'),
        upsertSettings: (settings: any) =>
            request<any>('/user/settings', { method: 'PUT', body: JSON.stringify(settings) }),
        getProfile: () => request<any>('/user/profile'),
        updateProfile: (patch: { name: string }) =>
            request<any>('/user/profile', { method: 'PATCH', body: JSON.stringify(patch) }),
        listSaved: () => request<any[]>('/user/saved'),
        addSaved: (item: any) =>
            request<any>('/user/saved', { method: 'POST', body: JSON.stringify(item) }),
        removeSaved: (id: string) =>
            request<{ ok: boolean }>(`/user/saved/${id}`, { method: 'DELETE' }),
        clearSaved: () =>
            request<{ ok: boolean }>('/user/saved', { method: 'DELETE' }),
    },

    islamic: {
        dailyAyah: () => request<any>('/islamic/daily-ayah'),
        dailyDua: () => request<any>('/islamic/daily-dua'),
        prayerTimes: (params: { lat?: number; lon?: number; city?: string; country?: string }) => {
            const q = new URLSearchParams();
            if (params.lat !== undefined) q.set('lat', String(params.lat));
            if (params.lon !== undefined) q.set('lon', String(params.lon));
            if (params.city) q.set('city', params.city);
            if (params.country) q.set('country', params.country);
            return request<any>(`/islamic/prayer-times?${q.toString()}`);
        },
        quranRecognition: (transcript: string) =>
            request<any>('/islamic/quran-recognition', { method: 'POST', body: JSON.stringify({ transcript }) }),
    },
};
