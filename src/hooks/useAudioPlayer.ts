import { useState, useRef, useEffect, useCallback } from 'react';

interface AudioPlayerState {
    isPlaying: boolean;
    isLoading: boolean;
    progress: number; // 0–1
    duration: number; // seconds
    error: string | null;
}

interface AudioPlayerControls {
    play: () => void;
    pause: () => void;
    toggle: () => void;
    seek: (fraction: number) => void;
    setUrl: (url: string) => void;
}

export function useAudioPlayer(initialUrl?: string): AudioPlayerState & AudioPlayerControls {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [url, setUrlState] = useState(initialUrl ?? '');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Create / replace audio element when URL changes
    useEffect(() => {
        if (!url) return;

        const audio = new Audio(url);
        audioRef.current = audio;
        setIsLoading(true);
        setProgress(0);
        setDuration(0);
        setError(null);

        audio.addEventListener('canplay', () => setIsLoading(false));
        audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
        audio.addEventListener('timeupdate', () => {
            if (audio.duration > 0) setProgress(audio.currentTime / audio.duration);
        });
        audio.addEventListener('ended', () => {
            setIsPlaying(false);
            setProgress(0);
        });
        audio.addEventListener('error', () => {
            setIsLoading(false);
            setError('Audio unavailable');
            setIsPlaying(false);
        });

        return () => {
            audio.pause();
            audio.src = '';
        };
    }, [url]);

    // Sync play/pause state to audio element
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) {
            audio.play().catch(() => {
                setIsPlaying(false);
                setError('Playback failed');
            });
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    const play = useCallback(() => setIsPlaying(true), []);
    const pause = useCallback(() => setIsPlaying(false), []);
    const toggle = useCallback(() => setIsPlaying(p => !p), []);
    const seek = useCallback((fraction: number) => {
        const audio = audioRef.current;
        if (audio && audio.duration > 0) {
            audio.currentTime = fraction * audio.duration;
        }
    }, []);
    const setUrl = useCallback((newUrl: string) => {
        setIsPlaying(false);
        setUrlState(newUrl);
    }, []);

    return { isPlaying, isLoading, progress, duration, error, play, pause, toggle, seek, setUrl };
}
