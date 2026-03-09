import {
    createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from 'react';
import { useAuth } from '@/context/AuthContext';
import { getSettings, upsertSettings } from '@/repositories/settingsRepository';
import { getProfile, updateProfile } from '@/repositories/profileRepository';

export type TextSize = 'small' | 'medium' | 'large';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';
export type VoiceGender = 'feminine' | 'masculine';

interface Settings {
    textSize: TextSize;
    voiceSpeed: VoiceSpeed;
    voiceGender: VoiceGender;
    userName: string;
}

interface SettingsContextValue extends Settings {
    setTextSize: (v: TextSize) => void;
    setVoiceSpeed: (v: VoiceSpeed) => void;
    setVoiceGender: (v: VoiceGender) => void;
    setUserName: (v: string) => void;
    voiceSpeedRate: number;
}

const DEFAULT: Settings = {
    textSize: 'medium', voiceSpeed: 'normal',
    voiceGender: 'feminine', userName: '',
};

const SPEED_RATE: Record<VoiceSpeed, number> = { slow: 0.85, normal: 1.0, fast: 1.15 };
const TEXT_SIZE_PX: Record<TextSize, string> = { small: '14px', medium: '16px', large: '19px' };
const LS_KEY = 'liyan_settings';

const lsLoad = (): Settings => {
    try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem(LS_KEY) || '{}') }; }
    catch { return DEFAULT; }
};
const lsSave = (s: Settings) => localStorage.setItem(LS_KEY, JSON.stringify(s));

const SettingsContext = createContext<SettingsContextValue>({
    ...DEFAULT, voiceSpeedRate: 1.0,
    setTextSize: () => { }, setVoiceSpeed: () => { },
    setVoiceGender: () => { }, setUserName: () => { },
});

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<Settings>(lsLoad);

    // Load from Supabase when authenticated
    useEffect(() => {
        if (!user) return;
        Promise.all([
            getSettings(user.id),
            getProfile(user.id),
        ]).then(([dbSettings, profile]) => {
            if (dbSettings) {
                const merged: Settings = {
                    textSize: (dbSettings.text_size as TextSize) ?? 'medium',
                    voiceSpeed: (dbSettings.voice_speed as VoiceSpeed) ?? 'normal',
                    voiceGender: (dbSettings.voice_gender as VoiceGender) ?? 'feminine',
                    userName: profile?.name ?? '',
                };
                setSettings(merged);
                lsSave(merged);
            }
        });
    }, [user?.id]);

    // Apply font size to <html>
    useEffect(() => {
        document.documentElement.style.fontSize = TEXT_SIZE_PX[settings.textSize];
    }, [settings.textSize]);

    const update = useCallback((patch: Partial<Settings>) => {
        setSettings(prev => {
            const next = { ...prev, ...patch };
            lsSave(next);
            if (user) {
                upsertSettings(user.id, {
                    text_size: next.textSize,
                    voice_speed: next.voiceSpeed,
                    voice_gender: next.voiceGender,
                });
            }
            return next;
        });
    }, [user]);

    const setUserName = useCallback((name: string) => {
        setSettings(prev => { const next = { ...prev, userName: name }; lsSave(next); return next; });
        if (user) updateProfile(user.id, { name });
    }, [user]);

    return (
        <SettingsContext.Provider value={{
            ...settings,
            voiceSpeedRate: SPEED_RATE[settings.voiceSpeed],
            setTextSize: v => update({ textSize: v }),
            setVoiceSpeed: v => update({ voiceSpeed: v }),
            setVoiceGender: v => update({ voiceGender: v }),
            setUserName,
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
