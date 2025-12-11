# SunoFlow API 使用文档

## 新增功能 API

### 1. 预览任务详情
获取单个任务的完整信息，用于预览模态框

**端点**: `GET /api/tasks/[id]`

**示例请求**:
```javascript
const response = await fetch(`/api/tasks/${taskId}`);
const { task } = await response.json();
```

**响应示例**:
```json
{
  "success": true,
  "task": {
    "id": "task-uuid",
    "title": "雨夜咖啡馆",
    "prompt": "下雨天的咖啡馆氛围音乐",
    "audioUrl": "https://...",
    "imageUrl": "https://...",
    "duration": 180.5,
    "tags": "雨天, 咖啡馆, 钢琴",
    "status": "COMPLETED",
    "isFavorite": false,
    "createdAt": "2025-12-05T...",
    "updatedAt": "2025-12-05T..."
  }
}
```

---

### 2. 收藏/取消收藏
切换任务的收藏状态

**端点**: `POST /api/tasks/[id]/favorite`

**示例请求**:
```javascript
const response = await fetch(`/api/tasks/${taskId}/favorite`, {
  method: 'POST'
});
const { isFavorite } = await response.json();
```

**响应示例**:
```json
{
  "success": true,
  "isFavorite": true,
  "task": { ...任务完整信息 }
}
```

**前端使用示例**:
```typescript
const toggleFavorite = async (taskId: string) => {
  try {
    const res = await fetch(`/api/tasks/${taskId}/favorite`, {
      method: 'POST',
    });
    const data = await res.json();

    if (data.success) {
      // 更新 UI 显示收藏状态
      console.log('收藏状态:', data.isFavorite ? '已收藏' : '未收藏');
    }
  } catch (error) {
    console.error('收藏失败:', error);
  }
};
```

---

### 3. 下载音频文件
获取音频下载链接，支持多种格式

**端点**: `GET /api/tasks/[id]/download?format=mp3`

**查询参数**:
- `format` (可选): 音频格式，支持 `mp3`, `wav`, `flac`，默认 `mp3`

**示例请求**:
```javascript
// 下载 MP3 格式
const response = await fetch(`/api/tasks/${taskId}/download?format=mp3`);
const { downloadUrl, filename } = await response.json();

// 下载 WAV 格式（注意：目前返回原始 MP3，格式转换待实现）
const response = await fetch(`/api/tasks/${taskId}/download?format=wav`);
```

**响应示例**:
```json
{
  "success": true,
  "downloadUrl": "https://cdn.suno.ai/...",
  "filename": "雨夜咖啡馆_task-uuid.mp3",
  "format": "mp3",
  "message": null
}
```

**前端使用示例（触发下载）**:
```typescript
const downloadAudio = async (taskId: string, format = 'mp3') => {
  try {
    const res = await fetch(`/api/tasks/${taskId}/download?format=${format}`);
    const data = await res.json();

    if (data.success) {
      // 创建隐藏的 a 标签触发下载
      const a = document.createElement('a');
      a.href = data.downloadUrl;
      a.download = data.filename;
      a.click();
    }
  } catch (error) {
    console.error('下载失败:', error);
  }
};
```

---

## 前端集成建议

### 预览模态框组件示例

```typescript
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';

interface PreviewModalProps {
  taskId: string;
  onClose: () => void;
}

export function PreviewModal({ taskId, onClose }: PreviewModalProps) {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      setTask(data.task);
      setLoading(false);
    };
    fetchTask();
  }, [taskId]);

  if (loading) return <div>加载中...</div>;

  return (
    <Dialog open onOpenChange={onClose}>
      <div className="preview-modal">
        {/* 封面图 */}
        <img src={task.imageUrl} alt={task.title} />

        {/* 标题和信息 */}
        <h2>{task.title}</h2>
        <p>{task.prompt}</p>

        {/* 音频播放器 */}
        <audio controls src={task.audioUrl} />

        {/* 操作按钮 */}
        <div className="actions">
          <button onClick={() => toggleFavorite(taskId)}>
            {task.isFavorite ? '取消收藏' : '收藏'}
          </button>
          <button onClick={() => downloadAudio(taskId, 'mp3')}>
            下载 MP3
          </button>
          <button onClick={() => downloadAudio(taskId, 'wav')}>
            下载 WAV
          </button>
        </div>
      </div>
    </Dialog>
  );
}
```

---

## 数据库迁移

在使用收藏功能前，需要先执行数据库迁移：

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行以下 SQL:

```sql
ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;
```

或者执行项目根目录下的 `ADD_FAVORITE_FIELD.sql` 文件。

---

## 注意事项

1. **格式转换**: 目前下载 API 只返回原始 MP3 文件，WAV 和 FLAC 格式转换功能待实现
2. **权限验证**: 所有 API 都会验证用户身份和任务所有权
3. **错误处理**: 建议前端添加适当的错误处理和用户提示
4. **收藏状态**: 在任务列表中显示收藏图标，方便用户快速识别

---

## 下一步开发建议

1. **音频格式转换**: 集成 FFmpeg 实现真正的格式转换
2. **批量下载**: 支持批量选择并打包下载多个任务
3. **收藏夹页面**: 创建专门的收藏夹页面筛选显示收藏的任务
4. **分享功能**: 生成分享链接让其他用户预览（不含下载）
5. **播放列表**: 允许用户创建和管理自定义播放列表
