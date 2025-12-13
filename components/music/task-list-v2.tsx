'use client';

import { useState } from 'react';
import { Task } from '@prisma/client';
import { Download, Music, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight, Play, Pause, FileText, Heart, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NextImage from 'next/image';
import { TaskProgress } from './task-progress';
import { LyricsDialog } from './lyrics-dialog'; // Import LyricsDialog
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { useLanguage } from '@/components/providers/language-provider';
import { usePlayerStore } from '@/lib/stores/player-store';

interface TaskListProps {
  tasks: Task[];
  onRefetch?: () => void;
}

// Notion-style pastel colors for badges
const BADGE_COLORS = {
  purple: 'bg-[#f6f3f9] text-[#6940a5]',
  blue: 'bg-[#e7f3f8] text-[#2c7cb0]',
  green: 'bg-[#eff9f1] text-[#2b713f]',
  red: 'bg-[#fdeded] text-[#d44c47]',
  orange: 'bg-[#faebd0] text-[#cf802b]',
  gray: 'bg-[#f1f1ef] text-[#5a5a5a]',
};

// 格式化失败原因
function formatFailReason(reason: string): string {
  const friendlyMessages: Record<string, string> = {
    'SENSITIVE_WORD': '内容敏感',
    'TIMEOUT': '生成超时',
    'NETWORK_ERROR': '网络错误',
    'AI_ERROR': 'API 错误',
    'Unknown': '未知错误',
  };
  if (reason.includes('Force cleaned')) return '系统清理';
  if (reason === 'Unknown') return '未知错误';
  return friendlyMessages[reason] || reason;
}

// 任务分组类型
interface TaskGroup {
  parent: Task;
  children: Task[];
}

// 将任务按父子关系分组
function groupTasks(tasks: Task[]): TaskGroup[] {
  const groups: TaskGroup[] = [];
  const processedIds = new Set<string>();

  tasks.forEach(task => {
    if (processedIds.has(task.id)) return;

    if (!task.parentAudioId) {
      const children = tasks.filter(t => t.parentAudioId === task.id);
      groups.push({ parent: task, children });
      processedIds.add(task.id);
      children.forEach(child => processedIds.add(child.id));
    }
  });

  // 添加孤儿任务
  tasks.forEach(task => {
    if (task.parentAudioId && !processedIds.has(task.id)) {
      groups.push({ parent: task, children: [] });
      processedIds.add(task.id);
    }
  });

  return groups;
}

export function TaskListV2({ tasks, onRefetch }: TaskListProps) {
  const { t } = useLanguage();
  const { currentTrack, isPlaying, setTrack } = usePlayerStore();
  // Restore expanded state, default all to closed except processing ones?
  // Or distinct logic: auto-expand recent ones. For now, empty set = all collapsed? 
  // User wants collapsible grouping. Let's default to collapse older ones, expand recent top one?
  // Let's default expand only the first group for convenience if it's recent.
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Logic to expand first group if exists
    // const firstParentId = tasks.find(t => !t.parentAudioId)?.id;
    // if (firstParentId) initial.add(firstParentId);
    return initial;
  });

  if (tasks.length === 0) {
    return null;
  }

  const taskGroups = groupTasks(tasks);

  // Auto-expand groups that have processing tasks
  useState(() => {
    const processingParentIds = taskGroups
      .filter(g => [g.parent, ...g.children].some(t => t.status === 'PROCESSING' || t.status === 'PENDING'))
      .map(g => g.parent.id);

    if (processingParentIds.length > 0) {
      setExpandedGroups(prev => {
        const next = new Set(prev);
        processingParentIds.forEach(id => next.add(id));
        return next;
      });
    }
  });

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handlePlay = (task: Task) => {
    setTrack(task);
  };

  const handleDownload = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!task.audioUrl) return;
    try {
      const response = await axios.get(`/api/tasks/${task.id}/download`);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleFavorite = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    try {
      await axios.post(`/api/tasks/${task.id}/favorite`);
      toast.success(task.isFavorite ? 'Removed from favorites' : 'Added to favorites');
      onRefetch?.();
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleDelete = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      toast.info('Delete functionality coming soon');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className={`notion-badge ${BADGE_COLORS.green}`}>{t('task.status.completed')}</span>;
      case 'FAILED':
        return <span className={`notion-badge ${BADGE_COLORS.red}`}>{t('task.status.failed')}</span>;
      case 'PROCESSING':
      case 'PENDING':
        return <span className={`notion-badge ${BADGE_COLORS.blue} animate-pulse`}>{t('task.status.generating')}</span>;
      default:
        return <span className={`notion-badge ${BADGE_COLORS.gray}`}>{status}</span>;
    }
  };

  const getGradient = (id: string) => {
    const gradients = [
      'bg-gradient-to-br from-pink-400 to-rose-300',
      'bg-gradient-to-br from-indigo-400 to-blue-300',
      'bg-gradient-to-br from-emerald-400 to-teal-300',
      'bg-gradient-to-br from-orange-400 to-amber-300',
      'bg-gradient-to-br from-violet-400 to-purple-300',
    ];
    return gradients[id.charCodeAt(0) % gradients.length];
  };

  const formatModelName = (modelId?: string) => {
    if (!modelId) return 'v3.5';
    switch (modelId) {
      case 'V3_5': return 'v3.5';
      case 'V4': return 'v4.0';
      case 'V4_5': return 'v4.5';
      case 'V4_5PLUS': return 'v4.5+';
      case 'V5': return 'v5.0';
      default: return modelId.toLowerCase().replace('_', '.');
    }
  };

  // Render a consolidated group card
  const renderTaskGroup = (group: { parent: Task, children: Task[] }) => {
    const { parent, children } = group;
    const allTasks = [parent, ...children];
    const isExpanded = expandedGroups.has(parent.id);

    // Check if any is processing
    const isAnyProcessing = allTasks.some(t => t.status === 'PROCESSING' || t.status === 'PENDING');

    return (
      <div className="transition-all duration-300">
        {/* Toggleable Header */}
        <div
          className="px-3 py-2 border-b border-gray-100 bg-gray-50/50 cursor-pointer hover:bg-gray-100/80 transition-colors select-none"
          onClick={() => toggleGroup(parent.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  {/* Chevron Indicator */}
                  <div className={cn("text-gray-400 transition-transform duration-300 shrink-0", isExpanded ? "rotate-90" : "")}>
                    <ChevronRight className="w-4 h-4" />
                  </div>

                  <h3 className="font-bold text-gray-900 flex items-center gap-2 truncate">
                    {parent.title || (isAnyProcessing ? t('task.status.generating') : 'Generated Collection')}
                    <span className="text-[10px] font-medium text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full shadow-sm shrink-0">
                      {allTasks.length}
                    </span>
                  </h3>
                </div>

                {/* Meta Info (Right Aligned) */}
                <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                  {parent.tags && (
                    <span className="truncate max-w-[150px] hidden sm:inline text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                      {parent.tags === 'High quality' ? 'HQ' : parent.tags}
                    </span>
                  )}
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    <div className={cn("w-1.5 h-1.5 rounded-full", parent.model?.includes('V4') ? "bg-purple-500" : "bg-blue-500")}></div>
                    {formatModelName(parent.model)}
                  </div>
                  <span className="hidden sm:inline" title={new Date(parent.createdAt).toLocaleString()}>
                    {(() => {
                      const date = new Date(parent.createdAt);
                      const now = new Date();
                      const diff = now.getTime() - date.getTime();
                      const minutes = Math.floor(diff / 60000);
                      const hours = Math.floor(diff / 3600000);

                      if (hours < 24) {
                        if (minutes < 1) return t('time.just_now') || 'Just now';
                        if (minutes < 60) return `${minutes}m ago`;
                        return `${hours}h ago`;
                      }

                      return date.toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      });
                    })()}
                  </span>
                </div>
              </div>

              <div className="pl-6">
                {/* Lyrics / Prompt Display */}
                {(() => {
                  const metadata = (parent as any).metadata;
                  const displayText = metadata?.prompt || parent.prompt;
                  const isLyrics = displayText?.includes('[') || displayText?.includes('\n'); // Simple heuristic

                  return displayText && (
                    <p className={cn(
                      "text-xs text-gray-500 font-serif transition-all",
                      isLyrics ? "italic whitespace-pre-line" : "",
                      isExpanded ? "line-clamp-[10]" : "line-clamp-1 opacity-80"
                    )}>
                      {displayText}
                    </p>
                  );
                })()}
              </div>
            </div>

            {/* Collapsed Preview Stack (Optional, simple thumbnails) */}
            {!isExpanded && (
              <div className="flex -space-x-2 mr-2">
                {allTasks.slice(0, 3).map((t, i) => (
                  <div key={t.id} className={cn("relative w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-gray-100", getGradient(t.id))}>
                    {t.imageUrl && <NextImage src={t.imageUrl} alt="" fill className="object-cover" sizes="32px" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tracks Grid (Collapsible) */}
        <div className={cn(
          "grid grid-cols-1 gap-3 transition-all duration-300 ease-in-out border-t border-gray-100",
          isExpanded ? "p-4 opacity-100 max-h-[1000px]" : "p-0 opacity-0 max-h-0 border-none overflow-hidden"
        )}>
          {allTasks.map((task, index) => renderTaskRow(task, `V${index + 1}`, true))}
        </div>
      </div>
    );
  };

  const renderTaskRow = (task: Task, versionLabel: string | null = null, isGrouped: boolean = false) => {
    const isCompleted = task.status === 'COMPLETED';
    const hasAudio = isCompleted && task.audioUrl;
    const taskIsPlaying = currentTrack?.id === task.id && isPlaying;
    const isProcessing = task.status === 'PROCESSING' || task.status === 'PENDING';

    return (
      <div
        key={task.id}
        className={cn(
          "group relative flex items-center gap-3 p-2 transition-all border-b border-stone-100 last:border-0 hover:bg-stone-50",
          !isGrouped && "bg-white" // Keep bg-white just in case, but remove margins/shadows
        )}
        onClick={() => hasAudio && handlePlay(task)}
      >
        {/* Cover Icon / Image (Smaller for grouped) */}
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded shadow-sm group/cover",
            isGrouped ? "w-10 h-10" : "w-12 h-12",
            getGradient(task.id)
          )}
        >
          {task.imageUrl ? (
            <NextImage src={task.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 768px) 48px, 64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/80">
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Music className={cn("drop-shadow-md", isGrouped ? "w-5 h-5" : "w-6 h-6")} />
              )}
            </div>
          )}

          {/* Play Overlay */}
          {hasAudio && (
            <div className={cn(
              "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity backdrop-blur-[1px]",
              isPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover/cover:opacity-100"
            )}>
              {taskIsPlaying ? (
                <Pause className={cn("text-white drop-shadow-md", isGrouped ? "w-5 h-5" : "w-6 h-6")} fill="white" />
              ) : (
                <Play className={cn("text-white drop-shadow-md", isGrouped ? "w-5 h-5" : "w-6 h-6")} fill="white" />
              )}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 truncate text-sm">
                {versionLabel ? `${t('task.version')} ${versionLabel.replace('V', '')}` : (
                  (task.title && task.title.toLowerCase() !== 'untitled' && task.title !== 'unTitled') ? task.title : t('task.untitled')
                )}
              </span>
              {!isGrouped && versionLabel && (
                <span className="text-xs text-gray-400 bg-gray-100 px-1 rounded">
                  {versionLabel}
                </span>
              )}
              {getStatusBadge(task.status)}
            </div>

            {/* Progress or Meta */}
            {(task.status === 'PROCESSING' || task.status === 'PENDING') ? (
              <div className="w-full mt-2 pr-4">
                <TaskProgress status={task.status} progress={task.progress} />
              </div>
            ) : (
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                {!isGrouped && (
                  <span className="flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                    <div className={cn("w-1.5 h-1.5 rounded-full", task.model?.includes('V4') ? "bg-purple-500" : "bg-blue-500")}></div>
                    {formatModelName(task.model)}
                  </span>
                )}
                {task.duration && (
                  <span className="font-mono flex items-center gap-1">
                    {Math.floor(task.duration)}s
                  </span>
                )}

                {(task.prompt || task.tags || (task as any).metadata?.prompt) && (
                  <LyricsDialog
                    title={task.title || 'Lyrics'}
                    lyrics={(task as any).metadata?.prompt || task.prompt}
                    trigger={
                      <button className="hover:text-gray-900 transition-colors flex items-center gap-0.5" title={t('task.action.lyrics')}>
                        <FileText className="w-3 h-3" />
                        <span className="hidden sm:inline">{t('task.action.lyrics')}</span>
                      </button>
                    }
                  />
                )}

                {/* Actions for Grouped View (Always visible or on hover) */}
                <div className="flex items-center gap-1 pl-2 border-l border-gray-100 ml-2">
                  {hasAudio && (
                    <button className="hover:text-gray-900 transition-colors" onClick={(e) => handleDownload(e, task)} title={t('task.action.download')}>
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button className={cn("hover:text-red-500 transition-colors", task.isFavorite && "text-red-500")} onClick={(e) => handleFavorite(e, task)}>
                    <Heart className={cn("w-3.5 h-3.5", task.isFavorite && "fill-current")} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side Status / Fail Reason */}
          {task.status === 'FAILED' && (
            <div className="text-xs text-red-500/80 flex items-center gap-1 bg-red-50/50 px-2 py-1 rounded max-w-[150px]" title={formatFailReason(task.failReason || 'Unknown')}>
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{formatFailReason(task.failReason || 'Unknown')}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {taskGroups.map((group) => {
        const hasChildren = group.children.length > 0;
        return (
          <div key={group.parent.id}>
            {hasChildren ? renderTaskGroup(group) : renderTaskRow(group.parent)}
          </div>
        );
      })}
    </div>
  );
}
