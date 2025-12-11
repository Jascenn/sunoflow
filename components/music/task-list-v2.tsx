'use client';

import { useState } from 'react';
import { Task } from '@prisma/client';
import { Download, Music, Clock, CheckCircle, XCircle, ChevronDown, ChevronRight, Play, Pause, FileText, Heart, Trash2, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  };
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { currentTrack, isPlaying, setTrack } = usePlayerStore();

  if (tasks.length === 0) {
    return null; // Empty state handled in parent
  }

  const taskGroups = groupTasks(tasks);

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
    // Use global player instead of local audio
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
      // Mock delete for now as API might not support it fully or we use soft delete
      // But we can try calling DELETE endpoint if it existed, or just hide it.
      // Suno API doesn't always support delete. We'll just toast for now or implement local hide.
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
        return <span className={`notion-badge ${BADGE_COLORS.blue}`}>{t('task.status.generating')}</span>;
      default:
        return <span className={`notion-badge ${BADGE_COLORS.gray}`}>{status}</span>;
    }
  };

  // Render a specific task row
  const renderTaskRow = (task: Task, versionLabel?: string, isChild: boolean = false) => {
    const isCompleted = task.status === 'COMPLETED';
    const hasAudio = isCompleted && task.audioUrl;
    const taskIsPlaying = currentTrack?.id === task.id && isPlaying;

    return (
      <div
        key={task.id}
        className={cn(
          "group relative flex items-start gap-4 py-3 px-2 rounded-sm transition-colors hover:bg-[rgba(55,53,47,0.03)]",
          isChild && "ml-6 border-l border-gray-200 pl-4 py-2"
        )}
      >
        {/* Cover Icon / Image */}
        <div
          className="w-10 h-10 shrink-0 mt-1 rounded bg-gray-100 border border-gray-200 overflow-hidden relative cursor-pointer group/cover"
          onClick={() => hasAudio && handlePlay(task)}
        >
          {task.imageUrl ? (
            <img src={task.imageUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <Music className="w-5 h-5" />
            </div>
          )}

          {/* Play Overlay */}
          {hasAudio && (
            <div className={cn(
              "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity",
              isPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover/cover:opacity-100"
            )}>
              {taskIsPlaying ? (
                <Pause className="w-5 h-5 text-white drop-shadow-sm" fill="white" />
              ) : (
                <Play className="w-5 h-5 text-white drop-shadow-sm" fill="white" />
              )}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 grid gap-1">
          {/* Title Row */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#37352f] truncate select-text">
              {versionLabel ? `${task.title || 'Generated Track'} (${versionLabel})` : (task.title || 'Generated Track')}
            </span>
            {getStatusBadge(task.status)}

            {/* Actions (Visible on Hover) */}
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              {hasAudio && (
                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-gray-900" onClick={(e) => handleDownload(e, task)} title={t('task.action.download')}>
                  <Download className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className={cn("h-6 w-6 text-gray-500 hover:text-red-500", task.isFavorite && "text-red-500")} onClick={(e) => handleFavorite(e, task)} title={t('task.action.favorite')}>
                <Heart className={cn("w-3.5 h-3.5", task.isFavorite && "fill-current")} />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-red-600" onClick={(e) => handleDelete(e, task)} title={t('task.action.delete')}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex items-center gap-3 text-xs text-[rgba(55,53,47,0.65)] h-5">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              {task.model || 'v3'}
            </span>

            {task.duration && (
              <span className="font-mono">{Math.floor(task.duration)}s</span>
            )}

            {task.tags && (
              <span className="flex-shrink-0 bg-[rgba(55,53,47,0.03)] px-1.5 rounded text-[11px] leading-relaxed">
                {task.tags}
              </span>
            )}

            <span className="font-mono opacity-50 flex items-center gap-2">
              {/* Lyrics Button */}
              {(task.prompt || task.tags) && (
                <LyricsDialog
                  title={task.title || 'Lyrics'}
                  lyrics={task.prompt} // Using prompt as lyrics proxy for now
                  trigger={
                    <button className="hover:text-[#37352f] transition-colors flex items-center gap-1 ml-2" title="View Lyrics">
                      <FileText className="w-3 h-3" />
                      <span className="hidden group-hover:inline">{t('task.action.lyrics')}</span>
                    </button>
                  }
                />
              )}
              <span className="ml-2">{new Date(task.createdAt).toLocaleDateString()}</span>
            </span>
          </div>

          {/* Extended Content: Prompt / Error / Progress */}
          <div className="text-sm mt-2">
            {/* Lyrics/Prompt Preview */}
            {task.prompt && (
              <p className="text-[rgba(55,53,47,0.85)] line-clamp-3 hover:line-clamp-none transition-all cursor-text font-serif italic text-xs leading-relaxed bg-stone-50 px-2.5 py-2 rounded border border-stone-200 shadow-sm mt-1">
                {task.prompt}
              </p>
            )}

            {/* Error Box */}
            {task.status === 'FAILED' && (
              <div className={`mt-2 p-2 rounded text-xs flex items-center gap-2 ${BADGE_COLORS.red}`}>
                <XCircle className="w-3.5 h-3.5" />
                <span>{formatFailReason(task.failReason || 'Unknown')}</span>
                <span>💰 {t('task.refunded')}</span>
              </div>
            )}

            {/* Progress Bar */}
            {(task.status === 'PROCESSING' || task.status === 'PENDING') && (
              <div className="mt-2 text-xs">
                <TaskProgress status={task.status} progress={task.progress} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {taskGroups.map((group) => {
        const hasChildren = group.children.length > 0;
        const isExpanded = expandedGroups.has(group.parent.id);
        const totalResults = 1 + group.children.length;

        return (
          <div key={group.parent.id} className="border-b border-gray-100 pb-4 last:border-0 hover:border-gray-200 transition-colors">
            {/* Group Header / Parent Task */}
            {hasChildren ? (
              <div>
                {/* Toggle Header */}
                <div
                  className="flex items-center gap-1 cursor-pointer hover:bg-[rgba(55,53,47,0.03)] -ml-2 p-1 rounded select-none mb-1"
                  onClick={() => toggleGroup(group.parent.id)}
                >
                  <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-[#37352f] text-sm flex items-center gap-2">
                    {group.parent.title || 'Untitled Collection'}
                    <span className="text-[10px] font-normal text-gray-400 border border-gray-200 px-1 rounded bg-white">
                      {totalResults} {t('task.items_count')}
                    </span>
                  </span>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mb-2">
                    {renderTaskRow(group.parent, 'Version 1', true)}
                    {group.children.map((child, index) => renderTaskRow(child, `Version ${index + 2}`, true))}
                  </div>
                )}

                {/* Collapsed Preview */}
                {!isExpanded && (
                  <div className="ml-6 pl-4 border-l border-gray-200 opacity-60">
                    <div className="text-xs text-gray-400 truncate font-serif italic">{group.parent.prompt}</div>
                  </div>
                )}
              </div>
            ) : (
              renderTaskRow(group.parent)
            )}
          </div>
        );
      })}
    </div>
  );
}
