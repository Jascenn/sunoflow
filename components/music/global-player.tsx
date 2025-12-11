'use client';

import { useEffect, useRef } from 'react';
import { usePlayerStore } from '@/lib/stores/player-store';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

export function GlobalPlayer() {
    const {
        currentTrack,
        isPlaying,
        volume,
        progress,
        duration,
        play,
        pause,
        togglePlay,
        setVolume,
        setProgress,
        setDuration,
        reset,
    } = usePlayerStore();

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Sync audio element with store
    useEffect(() => {
        if (!audioRef.current || !currentTrack?.audioUrl) return;

        audioRef.current.src = currentTrack.audioUrl;
        if (isPlaying) {
            audioRef.current.play();
        }
    }, [currentTrack, isPlaying]);

    // Handle play/pause from store
    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play().catch((err) => {
                console.error('Playback error:', err);
                pause();
            });
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, pause]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    // Update progress
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            setProgress(audio.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration);
        };

        const handleEnded = () => {
            pause();
            setProgress(0);
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [setProgress, setDuration, pause]);

    if (!currentTrack) return null;

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleProgressChange = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setProgress(value[0]);
        }
    };

    return (
        <>
            <audio ref={audioRef} />
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-stone-200 shadow-2xl">
                <div className="max-w-screen-2xl mx-auto px-4 py-3">
                    {/* Progress Bar */}
                    <div className="mb-2">
                        <Slider
                            value={[progress]}
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleProgressChange}
                            className="cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5 font-mono">
                            <span>{formatTime(progress)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Track Info */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {currentTrack.imageUrl ? (
                                    <img src={currentTrack.imageUrl} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl">🎵</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-sm text-gray-900 truncate">
                                    {currentTrack.title || 'Untitled'}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {currentTrack.tags || 'No tags'}
                                </div>
                            </div>
                        </div>

                        {/* Playback Controls */}
                        <div className="flex items-center gap-2">
                            <button
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
                                disabled
                                title="Previous"
                            >
                                <SkipBack className="w-4 h-4" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="p-3 bg-black hover:bg-gray-800 text-white rounded-full transition-all shadow-lg hover:shadow-xl"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5 fill-current" />
                                ) : (
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                )}
                            </button>

                            <button
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-30"
                                disabled
                                title="Next"
                            >
                                <SkipForward className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 w-32">
                            <button
                                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                {volume === 0 ? (
                                    <VolumeX className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <Volume2 className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            <Slider
                                value={[volume * 100]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(value) => setVolume(value[0] / 100)}
                                className="flex-1"
                            />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={reset}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2"
                            title="Close"
                        >
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
