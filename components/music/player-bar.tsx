'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/hooks/use-player-store';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

export function PlayerBar() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { currentTrack, isPlaying, volume, pause, resume, setVolume } = usePlayerStore();

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle track change
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    audioRef.current.src = currentTrack.audioUrl;
    if (isPlaying) {
      audioRef.current.play();
    }
  }, [currentTrack, isPlaying]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Show nothing if no track is loaded
  if (!currentTrack) {
    return null;
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-lg z-50">
      <audio
        ref={audioRef}
        onEnded={() => pause()}
        onError={(e) => {
          console.error('Audio playback error:', e);
          pause();
        }}
      />

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {currentTrack.imageUrl && (
              <img
                src={currentTrack.imageUrl}
                alt={currentTrack.title}
                className="w-12 h-12 rounded object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="font-medium truncate">{currentTrack.title}</p>
              <p className="text-xs text-gray-400">SunoFlow</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
              disabled
            >
              <SkipBack className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={togglePlayPause}
              className="text-white hover:bg-gray-800 w-10 h-10 rounded-full"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-gray-800"
              disabled
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 w-32">
            <button
              onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
              className="text-gray-400 hover:text-white"
            >
              {volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
