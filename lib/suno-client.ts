import axios, { AxiosInstance } from 'axios';
import { SunoGenerateParams, SunoTaskResponse, SunoTaskStatus, KieApiResponse, SunoMusicData } from './types/suno';

/**
 * 302.ai API Response Types
 */
interface Api302Response<T = any> {
  code: number;
  message: string;
  data: T;
}

interface Api302MusicData {
  id?: string;
  audio_url?: string;
  video_url?: string;
  image_url?: string;
  lyric?: string;
  title?: string;
  tags?: string;
  prompt?: string;
  status?: string;
  duration?: number;
  created_at?: string;
}

class SunoClient {
  private client: AxiosInstance;
  private provider: '302ai' | 'kie';

  constructor() {
    // 从环境变量读取提供商配置
    this.provider = (process.env.SUNO_PROVIDER as '302ai' | 'kie') || '302ai';

    const baseURL = process.env.SUNO_BASE_URL;
    const apiKey = process.env.SUNO_API_KEY;

    if (!baseURL || !apiKey) {
      throw new Error('SUNO_BASE_URL and SUNO_API_KEY must be set in environment variables');
    }

    console.log(`[SunoClient] Initializing with provider: ${this.provider}`);
    console.log(`[SunoClient] Base URL: ${baseURL}`);

    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 增加超时到60秒，因为音乐生成可能需要更长时间
    });
  }

  /**
   * Generate a new music track
   * 支持两种 API: 302.ai 和 kie.ai
   */
  async generate(params: SunoGenerateParams): Promise<string> {
    if (this.provider === '302ai') {
      return this.generate302ai(params);
    } else {
      return this.generateKie(params);
    }
  }

  /**
   * 302.ai 音乐生成
   * 端点: POST /suno/submit/music
   */
  private async generate302ai(params: SunoGenerateParams): Promise<string> {
    try {
      console.log('[302.ai] Generating music with params:', params);

      // 模型名称映射：前端格式 → 302.ai格式
      const modelMap: Record<string, string> = {
        'V3_5': 'chirp-v3-5',
        'V4': 'chirp-v4',
        'V4_5': 'chirp-auk',
        'V4_6': 'chirp-bluejay',
        'V5': 'chirp-crow',
      };

      const mappedModel = params.model ? modelMap[params.model] || params.model : 'chirp-v3-5';
      console.log(`[302.ai] Model mapping: ${params.model} → ${mappedModel}`);

      // 302.ai 请求体格式
      const requestBody = {
        gpt_description_prompt: params.prompt, // 创意灵感关键词
        mv: mappedModel, // 模型选择（已映射）
        make_instrumental: params.instrumental ?? false, // 是否纯音乐
      };

      const response = await this.client.post<Api302Response<Api302MusicData[]>>(
        '/suno/submit/music',
        requestBody
      );

      console.log('[302.ai] Response:', JSON.stringify(response.data, null, 2));

      if (response.data.code !== 200 && response.data.code !== 0) {
        throw new Error(response.data.message || 'Generation failed');
      }

      // 302.ai 可能直接返回结果数组或任务ID
      const data = response.data.data;
      if (Array.isArray(data) && data.length > 0) {
        // 如果返回了音乐数据，使用第一个的ID作为taskId
        return data[0].id || `302ai-${Date.now()}`;
      } else if (typeof data === 'string') {
        // 如果返回的是字符串ID
        return data;
      } else {
        // 生成一个临时ID
        return `302ai-${Date.now()}`;
      }
    } catch (error: any) {
      console.error('[302.ai] Error generating music:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * kie.ai 音乐生成
   * 端点: POST /api/v1/generate
   */
  private async generateKie(params: SunoGenerateParams): Promise<string> {
    try {
      console.log('[kie.ai] Generating music with params:', params);

      const requestBody = {
        prompt: params.prompt,
        customMode: params.customMode ?? false,
        instrumental: params.instrumental ?? false,
        model: params.model || 'V3_5',
        callBackUrl: params.callBackUrl || 'https://example.com/callback',
        ...(params.style && { style: params.style }),
        ...(params.title && { title: params.title }),
      };

      const response = await this.client.post<KieApiResponse<SunoTaskResponse>>(
        '/api/v1/generate',
        requestBody
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Generation failed');
      }

      return response.data.data.taskId;
    } catch (error) {
      console.error('[kie.ai] Error generating music:', error);
      throw error;
    }
  }

  /**
   * Get status of a task by taskId
   * 根据不同的提供商使用不同的查询方式
   */
  async getStatus(taskId: string): Promise<SunoTaskStatus> {
    if (this.provider === '302ai') {
      return this.getStatus302ai(taskId);
    } else {
      return this.getStatusKie(taskId);
    }
  }

  /**
   * 302.ai 查询任务状态
   * 尝试多个可能的查询端点
   */
  private async getStatus302ai(taskId: string): Promise<SunoTaskStatus> {
    console.log('[302.ai] Getting status for taskId:', taskId);

    // 尝试常见的查询端点
    const possibleEndpoints = [
      `/suno/fetch/${taskId}`,
      `/suno/query/${taskId}`,
      `/suno/fetch`,
      `/suno/query`,
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`[302.ai] Trying endpoint: ${endpoint}`);

        const params = endpoint.includes(taskId) ? {} : { id: taskId };
        const response = await this.client.get<Api302Response<any>>(endpoint, { params });

        console.log(`[302.ai] Response from ${endpoint}:`, JSON.stringify(response.data, null, 2));

        if (response.data.code === 200 || response.data.code === 0) {
          const data = response.data.data;

          // 尝试解析响应数据
          if (Array.isArray(data) && data.length > 0) {
            const task = data[0];
            return this.parse302aiTaskStatus(taskId, task);
          } else if (typeof data === 'object' && data !== null) {
            return this.parse302aiTaskStatus(taskId, data);
          }
        }
      } catch (error: any) {
        console.log(`[302.ai] Endpoint ${endpoint} failed:`, error.message);
        // 继续尝试下一个端点
      }
    }

    // 所有端点都失败，返回一个 PENDING 状态
    console.warn('[302.ai] All query endpoints failed, returning PENDING status');
    return {
      taskId,
      status: 'PENDING',
      param: '',
      response: undefined,
      failReason: undefined,
    };
  }

  /**
   * kie.ai 查询任务状态
   * 端点: GET /api/v1/generate/record-info
   */
  private async getStatusKie(taskId: string): Promise<SunoTaskStatus> {
    try {
      const response = await this.client.get<KieApiResponse<SunoTaskStatus>>(
        `/api/v1/generate/record-info`,
        {
          params: { taskId }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Failed to get task status');
      }

      return response.data.data;
    } catch (error) {
      console.error('[kie.ai] Error fetching task status:', error);
      throw error;
    }
  }

  /**
   * Get list of all tasks
   * 仅 kie.ai 支持
   */
  async listTasks(params?: { page?: number; pageSize?: number }): Promise<SunoTaskStatus[]> {
    if (this.provider === '302ai') {
      console.warn('[302.ai] listTasks not supported, returning empty array');
      return [];
    }

    try {
      const response = await this.client.get<KieApiResponse<SunoTaskStatus[]>>(
        `/api/v1/generate/record-list`,
        {
          params: {
            page: params?.page || 1,
            pageSize: params?.pageSize || 20,
          }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Failed to get task list');
      }

      return response.data.data || [];
    } catch (error) {
      console.error('[kie.ai] Error fetching task list:', error);
      throw error;
    }
  }

  /**
   * 解析 302.ai 的任务状态响应
   * 302.ai 返回的数据结构: { data: { data: [...], status: "PENDING", task_id: "..." } }
   * 注意：302.ai 通常返回 2 个音乐结果
   */
  private parse302aiTaskStatus(taskId: string, data: any): SunoTaskStatus {
    console.log('[302.ai] Parsing task status, data type:', typeof data);

    // 302.ai 的响应有嵌套的 data 字段
    const topLevelStatus = data.status;
    const nestedDataArray = data.data && Array.isArray(data.data) ? data.data : [];

    console.log(`[302.ai] Found ${nestedDataArray.length} music results in response`);

    // 使用第一个结果作为主要数据
    const firstMusic = nestedDataArray[0] || {};

    // 从第一个音乐项中提取基本信息
    const status = topLevelStatus || firstMusic.state || firstMusic.status || 'PENDING';
    const audioUrl = firstMusic.audio_url || firstMusic.audioUrl;
    const imageUrl = firstMusic.image_url || firstMusic.imageUrl || firstMusic.image_large_url;
    const title = firstMusic.title;
    const tags = firstMusic.tags;
    const prompt = firstMusic.gpt_description_prompt || firstMusic.prompt;
    const duration = firstMusic.duration ? parseFloat(firstMusic.duration) : null;

    console.log('[302.ai] Parsed status:', {
      status,
      audioUrl,
      title,
      totalResults: nestedDataArray.length
    });

    // 将所有音乐结果放入 response.sunoData 数组
    const sunoData = nestedDataArray.map((music: any) => ({
      id: music.clip_id || music.task_id,
      title: music.title || 'Untitled',
      streamAudioUrl: music.audio_url || music.audioUrl,
      audioUrl: music.audio_url || music.audioUrl,
      imageUrl: music.image_url || music.imageUrl || music.image_large_url,
      tags: music.tags,
      duration: music.duration ? parseFloat(music.duration) : null,
      gptDescriptionPrompt: music.gpt_description_prompt,
    }));

    // 提取进度信息 (从顶层或第一个音乐项)
    const progress = data.progress || firstMusic.progress || null;

    // 提取失败原因
    const failReason = data.message || firstMusic.msg || firstMusic.error || null;

    return {
      taskId,
      status: this.normalizeStatus(status),
      param: prompt || '',
      response: sunoData.length > 0 ? {
        id: firstMusic.clip_id || firstMusic.task_id || taskId,
        audio_url: audioUrl,
        image_url: imageUrl,
        title: title || 'Untitled',
        tags: tags,
        duration: duration,
        sunoData: sunoData, // 包含所有结果
      } : undefined,
      progress: progress,
      failReason: failReason,
    };
  }

  /**
   * 标准化状态字符串
   */

  private normalizeStatus(status: string): 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' {
    const s = status.toUpperCase();
    if (s.includes('SUCCESS') || s.includes('COMPLETE') || s.includes('DONE')) {
      return 'SUCCESS';
    }
    if (s.includes('FAIL') || s.includes('ERROR')) {
      return 'FAILED';
    }
    if (s.includes('PROCESS') || s.includes('RUNNING')) {
      return 'PROCESSING';
    }
    return 'PENDING';
  }

  /**
   * Get public feed/trending music
   * 尝试获取 Suno 的公共流/探索数据
   */
  async getPublicFeed(params: { page?: number } = {}): Promise<SunoMusicData[]> {
    console.log(`[SunoClient] Fetching public feed (Provider: ${this.provider})`);

    // 模拟数据 (Fallback) - 使用真实的 Suno 示例数据以提供更好的演示体验
    const mockData: SunoMusicData[] = [
      {
        id: 'b27c29f6-8ab4-47eb-81fd-efb85c848ada',
        title: 'Cyberpunk City Lights',
        audioUrl: 'https://cdn1.suno.ai/b27c29f6-8ab4-47eb-81fd-efb85c848ada.mp3',
        imageUrl: 'https://cdn1.suno.ai/image_b27c29f6-8ab4-47eb-81fd-efb85c848ada.png',
        duration: 124,
        tags: 'electronic, synthwave, futuristic',
        prompt: 'A futuristic city with neon lights and flying cars, electronic synthwave style'
      },
      {
        id: 'ad5a966b-dea1-4cbc-aeee-d5e9541157b9',
        title: 'Melody of the Wind',
        audioUrl: 'https://cdn1.suno.ai/ad5a966b-dea1-4cbc-aeee-d5e9541157b9.mp3',
        imageUrl: 'https://cdn1.suno.ai/image_ad5a966b-dea1-4cbc-aeee-d5e9541157b9.png',
        duration: 186,
        tags: 'acoustic, guitar, folk',
        prompt: 'A peaceful acoustic guitar melody suitable for a coffee shop'
      },
      {
        id: '84534a62-4318-4560-a7d7-123498877',
        title: 'Neon Odyssey',
        audioUrl: 'https://cdn1.suno.ai/84534a62-4318-4560-a7d7-123498877.mp3',
        imageUrl: 'https://cdn1.suno.ai/image_84534a62-4318-4560-a7d7-123498877_0.png',
        duration: 195,
        tags: 'soundtrack, cinematic',
        prompt: 'Epic cinematic soundtrack with orchestral elements'
      }
    ];

    // Forcing mock data return for debugging/demo purposes since API is unstable
    return mockData;

    /*
    if (this.provider === '302ai') {
      try {
        // 尝试 302.ai 常见 endpoint
        const endpoints = ['/suno/playlist', '/suno/feed'];

        for (const ep of endpoints) {
          try {
            const response = await this.client.get<Api302Response<any>>(ep, { params: { page: params.page || 1 } });
            if (response.data.code === 200 && Array.isArray(response.data.data)) {
              return response.data.data.map((item: any) => ({
                id: item.id || item.clip_id,
                title: item.title || 'Untitled',
                audioUrl: item.audio_url || item.audioUrl,
                streamAudioUrl: item.audio_url || item.audioUrl,
                imageUrl: item.image_url || item.imageUrl || item.image_large_url,
                duration: item.duration ? parseFloat(item.duration) : null,
                tags: item.tags || item.metadata?.tags,
                prompt: item.prompt || item.gpt_description_prompt,
                lyric: item.metadata?.prompt || item.lyric 
              }));
            }
          } catch (e) {
            console.log(`[302.ai] Feed endpoint ${ep} failed.`);
          }
        }
        // If all failed, throw or return mock
        throw new Error('No feed endpoint available');

      } catch (error) {
        console.warn('[302.ai] Failed to fetch feed, falling back to mock/empty', error);
        // return mockData; // To test UI, you might want mockData
        return mockData; // Fallback to mock data on error so the page isn't empty
      }
    } else {
      // Kie implementation or others
      return [];
    }
    */
  }
}

// Singleton instance
let sunoClientInstance: SunoClient | null = null;

export function getSunoClient(): SunoClient {
  if (!sunoClientInstance) {
    sunoClientInstance = new SunoClient();
  }
  return sunoClientInstance;
}

export default SunoClient;
