'use client';

import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  prompt: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress?: string;
  failReason?: string;
  model: string;
  createdAt: Date;
}

// 示例数据
const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Test - 敏感词失败示例',
    prompt: '包含敏感内容的音乐生成',
    status: 'FAILED',
    failReason: '内容包含敏感词汇,请修改后重试',
    model: 'V3_5',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Test - 网络错误示例',
    prompt: '生成一首轻松的爵士乐',
    status: 'FAILED',
    failReason: '网络连接超时,请稍后重试',
    model: 'V3_5',
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Test - 生成失败示例',
    prompt: '创作一首电子舞曲',
    status: 'FAILED',
    failReason: 'AI生成失败,请尝试修改提示词',
    model: 'V3_5',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '4',
    title: 'Test - 生成中',
    prompt: '正在生成的音乐',
    status: 'PROCESSING',
    progress: '60%',
    model: 'V3_5',
    createdAt: new Date(),
  },
  {
    id: '5',
    title: 'Test - 等待中',
    prompt: '等待处理的任务',
    status: 'PENDING',
    model: 'V3_5',
    createdAt: new Date(),
  },
];

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

// 格式化时间
function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

// 方案1: 图标悬停显示
function TaskCardHover({ task }: { task: Task }) {
  const renderFailedIcons = () => {
    if (task.status !== 'FAILED') return null;

    return (
      <div className="flex items-center gap-2">
        {/* 失败原因图标 */}
        {task.failReason && (
          <div className="relative group">
            <span className="text-red-500 text-lg cursor-help">⚠️</span>
            {/* 悬停提示 */}
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
              失败原因: {task.failReason}
              <div className="absolute top-full right-4 transform -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}

        {/* 退款提示图标 */}
        <div className="relative group">
          <span className="text-green-500 text-lg cursor-help">💰</span>
          {/* 悬停提示 */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
            已退回 5 积分到您的账户
            <div className="absolute top-full right-4 transform -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <span className="text-red-500 text-xl">❌</span>
      </div>
    );
  };

  const renderProgressBar = () => {
    if (task.status !== 'PROCESSING' && task.status !== 'PENDING') return null;

    const progress = task.progress ? parseInt(task.progress) : 0;

    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">
            {task.status === 'PENDING' ? '等待处理...' : '生成中...'}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {task.progress || '0%'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{task.prompt}</p>
        </div>
        {renderFailedIcons()}
      </div>

      {renderProgressBar()}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
          {task.model}
        </span>
        <span>•</span>
        <span>{task.status === 'FAILED' ? '失败' : task.status === 'PROCESSING' ? '处理中' : task.status === 'PENDING' ? '等待中' : '完成'}</span>
        <span>•</span>
        <span>{formatTime(task.createdAt)}</span>
      </div>
    </div>
  );
}

// 方案2: 右侧直接显示
function TaskCardDirect({ task }: { task: Task }) {
  const renderFailedInfo = () => {
    if (task.status !== 'FAILED') return null;

    return (
      <div className="mt-3 px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-r-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* 左侧: 失败原因 */}
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-xl font-bold">⚠️</span>
            <div>
              <span className="text-red-700 font-semibold text-sm">生成失败</span>
              {task.failReason && (
                <span className="text-red-600 text-sm ml-2">
                  • {formatFailReason(task.failReason)}
                </span>
              )}
            </div>
          </div>

          {/* 右侧: 退款提示 */}
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
            <span className="text-green-600 text-lg">💰</span>
            <span className="text-green-700 font-semibold text-sm">
              已退回 5 积分
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderProgressBar = () => {
    if (task.status !== 'PROCESSING' && task.status !== 'PENDING') return null;

    const progress = task.progress ? parseInt(task.progress) : 0;

    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">
            {task.status === 'PENDING' ? '等待处理...' : '生成中...'}
          </span>
          <span className="text-sm font-semibold text-blue-600">
            {task.progress || '0%'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {task.title}
            {task.status === 'FAILED' && <span className="text-red-500">❌</span>}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{task.prompt}</p>
        </div>
      </div>

      {renderFailedInfo()}
      {renderProgressBar()}

      <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
          {task.model}
        </span>
        <span>•</span>
        <span>{task.status === 'FAILED' ? '失败' : task.status === 'PROCESSING' ? '处理中' : task.status === 'PENDING' ? '等待中' : '完成'}</span>
        <span>•</span>
        <span>{formatTime(task.createdAt)}</span>
      </div>
    </div>
  );
}

export default function UIDemoPage() {
  const [activeScheme, setActiveScheme] = useState<'hover' | 'direct'>('direct');

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            失败状态UI方案对比
          </h1>
          <p className="text-gray-600">
            对比两种失败状态和退款提示的展示方案
          </p>
        </div>

        {/* 方案切换 */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setActiveScheme('hover')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeScheme === 'hover'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
          >
            方案1: 图标悬停显示
          </button>
          <button
            onClick={() => setActiveScheme('direct')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeScheme === 'direct'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
          >
            方案2: 右侧直接显示 (推荐)
          </button>
        </div>

        {/* 方案说明 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          {activeScheme === 'hover' ? (
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">方案1: 图标悬停显示</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ 界面简洁,不占用太多空间</li>
                <li>✅ 用户可选择性查看详情</li>
                <li>❌ 需要鼠标悬停才能看到详情(请将鼠标移到⚠️和💰图标上查看)</li>
                <li>❌ 移动端体验不佳(无悬停)</li>
              </ul>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">方案2: 右侧直接显示 (推荐)</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ 信息直观,一目了然</li>
                <li>✅ 移动端友好</li>
                <li>✅ 强化用户感知,提升透明度</li>
                <li>❌ 占用更多空间</li>
              </ul>
            </div>
          )}
        </div>

        {/* 任务列表 */}
        <div className="grid gap-4">
          {sampleTasks.map((task) => (
            <div key={task.id}>
              {activeScheme === 'hover' ? (
                <TaskCardHover task={task} />
              ) : (
                <TaskCardDirect task={task} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
