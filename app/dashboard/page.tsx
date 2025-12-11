'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/components/providers/language-provider';
import { toast } from 'sonner';
import { GeneratorForm } from '@/components/music/generator-form';
import { TaskListV2 } from '@/components/music/task-list-v2';
import { useTasks } from '@/hooks/use-tasks';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Loader2, User, Coins, RefreshCw, Home, Sparkles, Trophy, Play, Music } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { promptExamples } from '@/lib/prompt-examples';

const FEATURED_EXAMPLES = promptExamples.slice(0, 4).map((ex, index) => ({
  ...ex,
  coverColor: ['bg-pink-100', 'bg-blue-100', 'bg-purple-100', 'bg-orange-100'][index % 4]
}));

import { useSearchParams } from 'next/navigation';

// Inner component with useSearchParams
function DashboardContent() {
  const { user, isLoaded } = useUser();
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'favorites' ? 'favorites' : 'all';

  // Mode detection: Create vs Library
  const mode = searchParams.get('filter') ? 'library' : 'create';

  const { data, isLoading, refetch } = useTasks();
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<'all' | 'favorites'>(initialFilter);

  // Update state if URL changes
  useEffect(() => {
    const f = searchParams.get('filter') === 'favorites' ? 'favorites' : 'all';
    setFilter(f);
  }, [searchParams]);

  // 获取用户钱包余额
  const { data: walletData, refetch: refetchWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const res = await axios.get('/api/wallet');
      return res.data;
    },
    enabled: !!user,
  });

  const handleGenerate = async (params: any) => {
    try {
      setIsGenerating(true);
      const response = await axios.post('/api/generate', params);

      if (response.data.success) {
        toast.success('Generated successfully!', {
          description: `Balance: ${response.data.balance} credits`,
        });
        refetch();
        refetchWallet();
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      if (error.response?.status === 402) {
        toast.error('Insufficient Credits', {
          description: 'Need 5 credits.',
          action: {
            label: 'Top Up',
            onClick: () => window.location.href = '/account/billing',
          },
        });
      } else {
        toast.error('Failed', {
          description: error.response?.data?.error || error.message,
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSyncTasks = async () => {
    try {
      toast.info('Syncing tasks...', { description: 'Fetching from Suno API' });
      const response = await axios.post('/api/sync-tasks');
      if (response.data.success) {
        const { stats } = response.data;
        toast.success('Sync complete', {
          description: `Created ${stats.created}, Updated ${stats.updated}`,
        });
        refetch();
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast.error('Sync failed', {
        description: error.response?.data?.details || error.message,
      });
    }
  };


  const filteredTasks = data?.tasks?.filter(task => {
    if (filter === 'favorites') return task.isFavorite;
    return true;
  }) || [];

  return (
    <div className="flex h-full w-full bg-white text-stone-900 font-sans">
      {/* Left Column: Generator (Conditionally Rendered) */}
      {mode === 'create' && (
        <aside className="w-[420px] border-r border-stone-200 h-full flex flex-col bg-white">
          <div className="p-6 border-b border-stone-100 bg-white sticky top-0 z-10 flex items-center justify-between">
            <h2 className="font-bold text-xl flex items-center gap-2 tracking-tight">
              <Sparkles className="w-5 h-5 text-black" />
              {t('dashboard.create')}
            </h2>
            <div className="text-xs font-medium text-stone-400 bg-stone-50 px-2 py-1 rounded-md">V3.5 / V4</div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <GeneratorForm onGenerate={handleGenerate} isGenerating={isGenerating} />
          </div>
        </aside>
      )}

      {/* Right Column: Feed / List */}
      <main className="flex-1 h-full overflow-y-auto bg-stone-50/50 relative">
        {/* Header Section (Credits & Account) */}
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-stone-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{mode === 'library' ? t('sidebar.library') : t('dashboard.title')}</h1>
            <p className="text-xs text-stone-500 font-medium">{t('dashboard.subtitle')}</p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/recharge"
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm hover:border-stone-300 hover:shadow transition-all"
            >
              <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-stone-900">{walletData?.wallet?.balance ?? '...'}</span>
            </Link>

            <button onClick={handleSyncTasks} className="hover:bg-stone-100 p-2 rounded-full transition-colors text-stone-400 hover:text-stone-700" title="Sync Status">
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => (window as any).__openUserPanel?.()}
              className="flex items-center gap-2 pl-2 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-stone-200 ring-2 ring-white shadow-sm bg-stone-100 hover:ring-stone-300 transition-all">
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="Me" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>

        <div className={cn("p-8 mx-auto space-y-12", mode === 'library' ? 'max-w-7xl' : 'max-w-6xl')}>
          {/* Featured Section */}
          {mode === 'create' && (!data?.tasks?.length) && (
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <h3 className="font-bold text-stone-900 text-sm uppercase tracking-wider">{t('dashboard.start_style')}</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {FEATURED_EXAMPLES.map((ex, i) => (
                  <div
                    key={i}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all border border-stone-100 bg-white"
                    onClick={() => toast.info('Auto-fill not implemented yet', { description: 'Copy style manually for now.' })}
                  >
                    <div className={cn("absolute inset-0 opacity-20 transition-opacity group-hover:opacity-30", ex.coverColor)}></div>
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 bg-white/50 w-fit px-2 py-1 rounded backdrop-blur-sm">{ex.category}</span>
                      <h3 className="font-bold text-stone-900 text-lg leading-tight group-hover:translate-x-1 transition-transform">{ex.title}</h3>
                    </div>
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Task List */}
          <section className="min-h-[400px]">
            {/* Filter Tabs */}
            <div className="flex items-center gap-6 mb-8 border-b border-stone-200">
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  "text-sm font-semibold pb-3 transition-all relative",
                  filter === 'all'
                    ? "text-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-black"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                {t('dashboard.all_songs')}
              </button>
              <button
                onClick={() => setFilter('favorites')}
                className={cn(
                  "text-sm font-semibold pb-3 transition-all relative",
                  filter === 'favorites'
                    ? "text-red-500 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-500"
                    : "text-stone-500 hover:text-stone-800"
                )}
              >
                {t('dashboard.favorites')}
              </button>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 text-stone-400 gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-stone-300" />
                <span className="text-sm font-medium">{t('dashboard.fetching')}</span>
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                <TaskListV2 tasks={filteredTasks} onRefetch={refetch} />
              </div>
            ) : (
              <div className="py-32 text-center rounded-3xl bg-stone-50 border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm border border-stone-100">
                  {filter === 'favorites' ? '💕' : '🎹'}
                </div>
                <h3 className="font-bold text-stone-900 text-lg">
                  {filter === 'favorites' ? t('dashboard.empty_fav.title') : t('dashboard.empty.title')}
                </h3>
                <p className="text-stone-500 mt-2 max-w-sm mx-auto">
                  {filter === 'favorites' ? t('dashboard.empty_fav.desc') : t('dashboard.empty.desc')}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="h-full w-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-gray-400" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
