'use client';

import { Compass, Play, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import NextImage from 'next/image';
import { SunoMusicData } from '@/lib/types/suno';
import { useLanguage } from '@/components/providers/language-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

export function ExploreView() {
    const { t } = useLanguage();
    const [data, setData] = useState<SunoMusicData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchFeed() {
            try {
                const response = await axios.get('/api/explore?page=1');
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    setError(response.data.error || 'Failed to load feed');
                }
            } catch (err) {
                setError('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        }
        fetchFeed();
    }, []);

    if (loading) {
        return (
            <LoadingSpinner text={t('explore.discovering')} className="min-h-[50vh]" />
        );
    }

    if (error || data.length === 0) {
        return (
            <EmptyState
                icon={Compass}
                title={t('sidebar.explore')}
                description={error || t('explore.no_music')}
                className="min-h-[50vh]"
            />
        );
    }

    return (
        <div>
            {/* Note: Header is handled by Dashboard nowadays, but Explore has a specific one. 
                We can keep it or merge with Dashboard header. 
                To act as a "View", usually we don't render page-level titles if the dashboard header does it.
                But Dashboard header title changes based on mode.
            */}
            <header className="mb-8">
                <p className="text-stone-500 mt-2">{t('explore.subtitle')}</p>
            </header>

            <section>
                <h2 className="text-lg font-semibold mb-4 text-stone-900">{t('explore.trending_now')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.map((track) => (
                        <div key={track.id} className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer flex flex-col h-full hover:-translate-y-1">
                            <div className="h-40 w-full bg-stone-100 relative flex items-center justify-center overflow-hidden shrink-0">
                                {track.imageUrl ? (
                                    <NextImage src={track.imageUrl} alt={track.title} fill className="object-cover transition-transform group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                                ) : (
                                    <Music className="w-10 h-10 text-stone-300" />
                                )}
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />

                                {track.audioUrl && (
                                    <div className="absolute z-10 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
                                        <Play className="w-5 h-5 text-stone-900 fill-current ml-0.5" />
                                    </div>
                                )}

                                {track.audioUrl && (
                                    <audio src={track.audioUrl} className="hidden group-hover:block absolute bottom-0 w-full h-8" controls />
                                )}
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-stone-900 line-clamp-1 mb-1">{track.title || t('explore.untitled')}</h3>

                                {/* Tags */}
                                {track.tags && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {track.tags.split(',').slice(0, 3).map((tag, idx) => (
                                            <span key={idx} className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100">{tag.trim()}</span>
                                        ))}
                                    </div>
                                )}

                                {/* Lyrics / Prompt Display */}
                                <div className="flex-1 min-h-[60px] max-h-[100px] overflow-hidden relative">
                                    <p className="text-xs text-stone-500 whitespace-pre-wrap leading-relaxed">
                                        {track.lyric || track.prompt || t('explore.no_description')}
                                    </p>
                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent" />
                                </div>

                                <div className="flex items-center justify-between mt-3 text-xs text-stone-400 border-t border-stone-50 pt-2">
                                    <span>{track.duration ? `${Math.floor(track.duration)}s` : ''}</span>
                                    <span className="bg-stone-50 px-1.5 rounded font-mono text-stone-500">{track.id.slice(0, 6)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
