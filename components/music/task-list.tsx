'use client';

import { useState } from 'react';
import { Task } from '@prisma/client';
import { Download, Music, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskProgress } from './task-progress';

interface TaskListProps {
  tasks: Task[];
}

// 格式化失败原因
function formatFailReason(reason: string): string {
  const friendlyMessages: Record<string, string> = {
    'SENSITIVE_WORD': '内容包含敏感词汇',
    'TIMEOUT': '生成超时',
    'NETWORK_ERROR': '网络连接失败',
    'AI_ERROR': 'AI生成失败',
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
    // 跳过已处理的任务
    if (processedIds.has(task.id)) return;

    // 如果是父任务或独立任务
    if (!task.parentAudioId) {
      // 查找所有子任务
      const children = tasks.filter(t => t.parentAudioId === task.id);

      groups.push({
        parent: task,
        children: children,
      });

      // 标记为已处理
      processedIds.add(task.id);
      children.forEach(child => processedIds.add(child.id));
    }
  });

  // 添加没有父任务的子任务(孤儿任务)
  tasks.forEach(task => {
    if (task.parentAudioId && !processedIds.has(task.id)) {
      groups.push({
        parent: task,
        children: [],
      });
      processedIds.add(task.id);
    }
  });

  return groups;
}

export function TaskList({ tasks }: TaskListProps) {
  // 管理每个任务组的展开/折叠状态
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p>No music generated yet.</p>
        <p className="text-sm mt-2">Start by generating your first track!</p>
      </div>
    );
  }

  // 将任务分组
  const taskGroups = groupTasks(tasks);

  // 切换展开/折叠
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PROCESSING':
      case 'PENDING':
        return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PROCESSING':
      case 'PENDING':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Tracks</h2>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start gap-4">
              {/* Album Art */}
              <div className="w-24 h-24 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                {task.imageUrl ? (
                  <img
                    src={task.imageUrl}
                    alt={task.title || 'Music cover'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">
                      {task.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {task.prompt}
                    </p>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                    {task.status}
                  </div>
                </div>

                {task.tags && (
                  <div className="mb-2">
                    <span className="text-xs text-gray-500">
                      {task.tags}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{task.model}</span>
                  <span>•</span>
                  <span>{new Date(task.createdAt).toLocaleString()}</span>
                  {task.duration && (
                    <>
                      <span>•</span>
                      <span>{Math.round(task.duration)}s</span>
                    </>
                  )}
                </div>

                {/* 失败信息 */}
                {task.status === 'FAILED' && (
                  <div className="mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-red-700">生成失败</p>
                          <p className="text-sm text-red-600">
                            {formatFailReason(task.failReason || 'Unknown Error')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-green-200 rounded-full shadow-sm">
                        <span className="text-lg">💰</span>
                        <span className="text-sm font-medium text-green-700">
                          已自动退款
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 进度条 */}
                {(task.status === 'PROCESSING' || task.status === 'PENDING') && (
                  <TaskProgress status={task.status} progress={task.progress} />
                )}

                {/* Audio Player and Download */}
                {task.status === 'COMPLETED' && task.audioUrl && (
                  <div className="mt-3 flex items-center gap-2">
                    <audio
                      src={task.audioUrl}
                      controls
                      className="flex-1 h-10"
                      preload="metadata"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(task.audioUrl!, '_blank')}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
