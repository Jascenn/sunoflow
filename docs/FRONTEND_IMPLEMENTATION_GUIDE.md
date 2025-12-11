# 前端实现指南 - 任务状态展示优化

## 📝 实现状态 (2025-12-05更新)

### ✅ 已完成
1. **进度条显示** - 已集成到 [task-list.tsx](components/music/task-list.tsx)
2. **失败状态显示(方案2)** - 已集成到 [task-list.tsx](components/music/task-list.tsx)
3. **Demo页面** - 可访问 http://localhost:3000/ui-demo 查看两种方案对比
4. **后端支持** - progress 和 failReason 字段已添加并在API中保存

### ⏳ 待完成
1. **多结果任务分组** - 将2个音频结果整合到一个任务卡片内展示
2. **自动轮询优化** - 智能调整轮询频率

---

## 概述

本文档说明如何在前端实现以下三个功能:
1. PENDING/PROCESSING状态显示实时进度 ✅
2. FAILED状态显示失败原因和退款提示 ✅
3. 多结果(2个音频)整合到一个任务卡片内展示 ⏳

## 1. 数据结构

### Task对象新增字段

```typescript
interface Task {
  id: string;
  userId: string;
  sunoTaskId?: string;
  prompt: string;
  tags?: string;
  model: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  title?: string;
  audioUrl?: string;
  imageUrl?: string;
  duration?: number;
  parentAudioId?: string;
  isFavorite: boolean;
  progress?: string;      // 新增: 进度信息,如 "50%"
  failReason?: string;    // 新增: 失败原因
  createdAt: Date;
  updatedAt: Date;
}
```

### 后端API响应

`GET /api/tasks` 返回:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "xxx",
      "status": "PROCESSING",
      "progress": "50%",
      "title": "测试音乐",
      ...
    },
    {
      "id": "yyy",
      "status": "FAILED",
      "failReason": "内容包含敏感词汇",
      ...
    }
  ]
}
```

## 2. PENDING/PROCESSING 状态进度显示

### 视觉设计

```
┌─────────────────────────────────────────┐
│ 🎵 Test - 电子舞曲                       │
│ 电子舞曲,强劲的节奏                      │
│                                         │
│ ⏳ 生成中...                             │
│ ████████░░░░░░░░ 50%                    │
│                                         │
│ V4 • 处理中 • 刚刚                       │
└─────────────────────────────────────────┘
```

### React组件示例

```tsx
function TaskCard({ task }: { task: Task }) {
  // 渲染进度条
  const renderProgress = () => {
    if (task.status !== 'PENDING' && task.status !== 'PROCESSING') {
      return null;
    }

    const progressValue = task.progress ? parseInt(task.progress) : 0;

    return (
      <div className="mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            ⏳ 生成中...
          </span>
          <span className="text-sm font-medium text-blue-600">
            {task.progress || '0%'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="task-card">
      {/* 标题和描述 */}
      <h3>{task.title}</h3>
      <p>{task.prompt}</p>

      {/* 进度条 */}
      {renderProgress()}

      {/* 其他内容 */}
    </div>
  );
}
```

### 进度状态映射

建议根据API返回的状态,显示不同的文案:

```typescript
const getProgressText = (status: string, progress?: string) => {
  if (status === 'PENDING') {
    return '⏱️ 等待处理...';
  }
  if (status === 'PROCESSING') {
    if (!progress || progress === '0%') {
      return '⏳ 正在生成歌词...';
    }
    const value = parseInt(progress);
    if (value < 30) {
      return '⏳ 正在生成歌词...';
    } else if (value < 70) {
      return '🎵 正在生成音频...';
    } else {
      return '🎼 正在渲染完成...';
    }
  }
  return '';
};
```

## 3. FAILED 状态显示失败原因和退款提示

### 方案对比

#### 方案1: 图标悬停显示(节省空间)

**优点**:
- 界面简洁,不占用太多空间
- 用户可选择性查看详情
- 适合列表密集展示

**缺点**:
- 需要鼠标悬停才能看到详情
- 移动端体验不佳(无悬停)
- 信息不够直观

**视觉设计**:
```
┌─────────────────────────────────────────┐
│ 🎵 Test - 失败示例    [⚠️] [💰]      ❌  │
│ 测试失败的任务示例                       │
│                                         │
│ [鼠标悬停⚠️时显示]                       │
│ ┌─────────────────────┐                 │
│ │ 失败原因:           │                 │
│ │ 内容包含敏感词汇    │                 │
│ └─────────────────────┘                 │
│                                         │
│ V3_5 • 失败 • 30分钟前                   │
└─────────────────────────────────────────┘
```

#### 方案2: 右侧直接显示(推荐)

**优点**:
- 信息直观,一目了然
- 移动端友好
- 强化用户感知,提升透明度

**缺点**:
- 占用更多空间
- 失败任务会显得更突出

**视觉设计**:
```
┌─────────────────────────────────────────────────────────┐
│ 🎵 Test - 失败示例                                  ❌  │
│ 测试失败的任务示例                                       │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ 生成失败 • 内容包含敏感词汇    💰 已退回 5 积分   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ V3_5 • 失败 • 30分钟前                                   │
└─────────────────────────────────────────────────────────┘
```

### 方案1实现: 图标悬停显示

```tsx
function TaskCard({ task }: { task: Task }) {
  const renderFailedIcons = () => {
    if (task.status !== 'FAILED') {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        {/* 失败原因图标 */}
        {task.failReason && (
          <div className="relative group">
            <span className="text-red-500 text-lg cursor-help">⚠️</span>
            {/* 悬停提示 */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
              失败原因: {task.failReason}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        )}

        {/* 退款提示图标 */}
        <div className="relative group">
          <span className="text-green-500 text-lg cursor-help">💰</span>
          {/* 悬停提示 */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            已退回 5 积分到您的账户
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="task-card">
      <div className="flex items-start justify-between">
        <h3>{task.title}</h3>
        {renderFailedIcons()}
      </div>
      {/* 其他内容 */}
    </div>
  );
}
```

### 方案2实现: 右侧直接显示(推荐)

```tsx
function TaskCard({ task }: { task: Task }) {
  const renderFailedInfo = () => {
    if (task.status !== 'FAILED') {
      return null;
    }

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

  return (
    <div className="task-card">
      <h3>{task.title} {task.status === 'FAILED' && '❌'}</h3>
      <p>{task.prompt}</p>

      {/* 失败信息 */}
      {renderFailedInfo()}

      {/* 其他内容 */}
    </div>
  );
}
```

### React组件示例(原方案 - 信息框展示)

```tsx
function TaskCard({ task }: { task: Task }) {
  // 渲染失败信息
  const renderFailedInfo = () => {
    if (task.status !== 'FAILED') {
      return null;
    }

    return (
      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-red-600 text-xl">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">
              生成失败
            </p>
            {task.failReason && (
              <p className="text-sm text-red-600 mb-2">
                失败原因: {task.failReason}
              </p>
            )}
            <p className="text-sm text-green-600 flex items-center gap-1">
              <span>💰</span>
              <span>已退回 5 积分到您的账户</span>
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="task-card">
      {/* 标题 */}
      <h3>{task.title} {task.status === 'FAILED' && '❌'}</h3>

      {/* 失败信息 */}
      {renderFailedInfo()}

      {/* 其他内容 */}
    </div>
  );
}
```

### 失败原因文案映射

建议对后端返回的错误信息进行友好化处理:

```typescript
const formatFailReason = (reason?: string) => {
  if (!reason) return '未知错误，请重试';

  const reasonMap: Record<string, string> = {
    'SENSITIVE_WORD_ERROR': '内容包含敏感词汇，请修改后重试',
    'GENERATE_AUDIO_FAILED': '音频生成失败，请重试',
    'CREATE_TASK_FAILED': '任务创建失败，请稍后重试',
    'CALLBACK_EXCEPTION': '服务异常，已为您退款',
  };

  return reasonMap[reason] || reason;
};
```

## 4. 多结果整合展示方案

### 数据分组逻辑

前端需要将带有`parentAudioId`的子任务归到父任务下:

```typescript
function groupTasksByParent(tasks: Task[]) {
  const grouped: Map<string, { parent: Task; children: Task[] }> = new Map();

  tasks.forEach(task => {
    if (!task.parentAudioId) {
      // 这是父任务
      if (!grouped.has(task.id)) {
        grouped.set(task.id, { parent: task, children: [] });
      }
    } else {
      // 这是子任务
      const group = grouped.get(task.parentAudioId);
      if (group) {
        group.children.push(task);
      } else {
        // 如果父任务还没加载,创建占位
        grouped.set(task.parentAudioId, {
          parent: null as any,
          children: [task]
        });
      }
    }
  });

  return Array.from(grouped.values());
}
```

### 视觉设计 - 折叠状态

```
┌─────────────────────────────────────────┐
│ 🎵 Test - 中国风韵             ⭐ 收藏  │
│ 中国风音乐,古筝和琵琶                    │
│ ┌─────────────────────┐                 │
│ │ 📀 2个结果           │  [▼ 展开]      │
│ └─────────────────────┘                 │
│ V3_5 • 完成 • 2小时前                    │
└─────────────────────────────────────────┘
```

### 视觉设计 - 展开状态

```
┌─────────────────────────────────────────┐
│ 🎵 Test - 中国风韵             ⭐ 收藏  │
│ 中国风音乐,古筝和琵琶                    │
│                                   [▲ 收起]│
│ ┌─────────────────────────────────────┐ │
│ │ 🎵 结果 1 (163.4s)            ▶️ 播放 │ │
│ │ [音频波形图]                          │ │
│ │ [下载] [分享]                         │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 🎵 结果 2 (182.6s)            ▶️ 播放 │ │
│ │ [音频波形图]                          │ │
│ │ [下载] [分享]                         │ │
│ └─────────────────────────────────────┘ │
│ V3_5 • 完成 • 2小时前                    │
└─────────────────────────────────────────┘
```

### React组件示例

```tsx
function TaskGroup({ parent, children }: { parent: Task; children: Task[] }) {
  const [expanded, setExpanded] = useState(false);
  const allResults = [parent, ...children].filter(t => t.audioUrl);

  return (
    <div className="task-card">
      {/* 标题和基本信息 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3>{parent.title}</h3>
          <p className="text-sm text-gray-600">{parent.prompt}</p>
        </div>
        <button
          onClick={() => toggleFavorite(parent.id)}
          className="text-xl"
        >
          {parent.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {/* 多结果提示 */}
      {allResults.length > 1 && (
        <div className="mb-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm text-blue-600"
          >
            <span>📀 {allResults.length}个结果</span>
            <span>{expanded ? '▲ 收起' : '▼ 展开'}</span>
          </button>
        </div>
      )}

      {/* 音频列表 */}
      {expanded ? (
        <div className="space-y-2">
          {allResults.map((result, index) => (
            <div key={result.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  🎵 结果 {index + 1} ({result.duration?.toFixed(1)}s)
                </span>
                <button className="text-blue-600">▶️ 播放</button>
              </div>
              <audio
                src={result.audioUrl}
                controls
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button className="text-sm text-gray-600">下载</button>
                <button className="text-sm text-gray-600">分享</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 只显示第一个结果的简化版
        allResults[0]?.audioUrl && (
          <audio
            src={allResults[0].audioUrl}
            controls
            className="w-full"
          />
        )
      )}

      {/* 元数据 */}
      <div className="mt-3 text-xs text-gray-500">
        {parent.model} • {parent.status} • {formatTime(parent.createdAt)}
      </div>
    </div>
  );
}
```

### 主列表组件

```tsx
function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // 轮询获取任务状态
    const interval = setInterval(async () => {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data.tasks);
    }, 3000); // 每3秒刷新一次

    return () => clearInterval(interval);
  }, []);

  // 分组任务
  const taskGroups = groupTasksByParent(tasks);

  return (
    <div className="space-y-4">
      {taskGroups.map(group => (
        <TaskGroup
          key={group.parent.id}
          parent={group.parent}
          children={group.children}
        />
      ))}
    </div>
  );
}
```

## 5. 样式建议

### Tailwind CSS 类名

```css
/* 进度条 */
.progress-bar {
  @apply w-full bg-gray-200 rounded-full h-2;
}

.progress-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}

/* 失败状态 */
.failed-card {
  @apply p-3 bg-red-50 border border-red-200 rounded-lg;
}

.failed-text {
  @apply text-sm text-red-600;
}

.refund-text {
  @apply text-sm text-green-600 flex items-center gap-1;
}

/* 多结果展开/收起 */
.expand-button {
  @apply flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700;
}

.result-card {
  @apply p-3 bg-gray-50 rounded-lg border border-gray-200;
}
```

## 6. 状态管理建议

建议使用Context或状态管理库来管理:

```typescript
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  expandedTasks: Set<string>; // 记录哪些任务是展开的
}

const TaskContext = createContext<{
  state: TaskState;
  actions: {
    fetchTasks: () => Promise<void>;
    toggleExpand: (taskId: string) => void;
    toggleFavorite: (taskId: string) => Promise<void>;
  };
}>(null!);
```

## 7. 轮询策略

```typescript
// 智能轮询：有PENDING/PROCESSING任务时频繁轮询，否则降低频率
function useTaskPolling() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const hasPendingTasks = tasks.some(
      t => t.status === 'PENDING' || t.status === 'PROCESSING'
    );

    const interval = hasPendingTasks ? 3000 : 10000; // 3秒 vs 10秒

    const timer = setInterval(fetchTasks, interval);
    return () => clearInterval(timer);
  }, [tasks]);

  const fetchTasks = async () => {
    const response = await fetch('/api/tasks');
    const data = await response.json();
    setTasks(data.tasks);
  };

  return tasks;
}
```

## 8. 关键注意事项

1. **进度条平滑过渡**: 使用CSS transition让进度条变化更平滑
2. **音频播放器**: 一次只能播放一个音频,停止其他正在播放的
3. **退款提示**: 只在FAILED状态显示一次,可考虑添加动画
4. **折叠状态持久化**: 使用localStorage记住用户的展开/收起偏好
5. **加载状态**: 在轮询时避免页面闪烁,使用乐观更新
6. **错误处理**: API失败时显示友好的错误提示

## 9. 完整示例代码位置

前端完整实现示例将在以下位置提供:
- `/components/TaskCard.tsx` - 任务卡片组件
- `/components/TaskList.tsx` - 任务列表组件
- `/hooks/useTaskPolling.ts` - 轮询Hook
- `/utils/taskHelpers.ts` - 辅助函数

## 10. 后端已完成

✅ 数据库schema已更新(progress, failReason字段)
✅ `/api/tasks` API已返回progress和failReason
✅ 多结果已自动创建子任务记录
✅ FAILED任务自动退款逻辑(待实现)

请在Supabase执行SQL脚本 `ADD_PROGRESS_FAILREASON_FIELDS.sql` 来添加新字段。
