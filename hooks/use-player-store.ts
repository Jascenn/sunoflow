import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl?: string;
}

interface PlayerStore {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;

  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,

  setCurrentTrack: (track) => set({ currentTrack: track }),

  setIsPlaying: (playing) => set({ isPlaying: playing }),

  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

  play: (track) => set({ currentTrack: track, isPlaying: true }),

  pause: () => set({ isPlaying: false }),

  resume: () => set({ isPlaying: true }),

  stop: () => set({ currentTrack: null, isPlaying: false }),
}));
