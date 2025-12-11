import { create } from 'zustand';
import { Task } from '@prisma/client';

interface PlayerState {
    currentTrack: Task | null;
    isPlaying: boolean;
    volume: number;
    progress: number;
    duration: number;

    setTrack: (track: Task | null) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setProgress: (progress: number) => void;
    setDuration: (duration: number) => void;
    reset: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    currentTrack: null,
    isPlaying: false,
    volume: 0.7,
    progress: 0,
    duration: 0,

    setTrack: (track) => set({ currentTrack: track, progress: 0, isPlaying: !!track }),
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
    setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),
    reset: () => set({ currentTrack: null, isPlaying: false, progress: 0, duration: 0 }),
}));
