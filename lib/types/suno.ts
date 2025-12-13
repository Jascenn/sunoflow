export type SunoModel = 'chirp-v3-5' | 'chirp-v3-0';

// kie.ai API 请求参数 (基于官方文档)
export interface SunoGenerateParams {
  prompt: string; // 音乐描述 (500-5000字符)
  customMode?: boolean; // false=简单模式, true=高级模式 (默认false)
  instrumental?: boolean; // true=纯音乐, false=带人声 (默认false)
  model?: 'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5'; // 模型版本 (默认V3_5)
  style?: string; // 音乐风格 (customMode=true时使用)
  title?: string; // 歌曲标题 (customMode=true时使用)
  callBackUrl?: string; // 异步回调地址
  tags?: string; // Additional tags (used in tests or some API versions)
}

// kie.ai API 响应格式
export interface KieApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

// 生成任务响应
export interface SunoTaskResponse {
  taskId: string; // kie.ai 返回的任务ID
}

// Suno 音乐数据项 (嵌套在响应中)
export interface SunoMusicData {
  id: string;
  audioUrl?: string;
  streamAudioUrl?: string;
  imageUrl?: string;
  prompt?: string;
  modelName?: string;
  title?: string;
  tags?: string;
  createTime?: number;
  duration?: number | null;
  gptDescriptionPrompt?: string;
  lyric?: string;
  metadata?: any;
}

// 任务响应数据 (嵌套在 data.response 中)
export interface SunoTaskResponseData {
  taskId?: string;
  id?: string; // Added to support suno-client return
  sunoData?: SunoMusicData[];
  audio_url?: string;
  image_url?: string;
  title?: string;
  tags?: string;
  duration?: number | null;
}

// 任务状态响应 (基于实际 API 响应)
export type SunoStatusType = 'PENDING' | 'SUCCESS' | 'FIRST_SUCCESS' | 'TEXT_SUCCESS' | 'CREATE_TASK_FAILED' | 'GENERATE_AUDIO_FAILED' | 'CALLBACK_EXCEPTION' | 'SENSITIVE_WORD_ERROR' | 'PROCESSING' | 'FAILED';

export interface SunoTaskStatus {
  taskId: string;
  parentMusicId?: string;
  param?: string;
  response?: SunoTaskResponseData;
  status: SunoStatusType;
  type?: string;
  operationType?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  createTime?: number;
  progress?: string; // 进度信息,如 "50%"
  failReason?: string; // 失败原因
}
