import axios, { AxiosInstance } from 'axios';
import { SunoGenerateParams, SunoTaskResponse, SunoTaskStatus, KieApiResponse } from './types/suno';

class SunoClient {
  private client: AxiosInstance;

  constructor() {
    const baseURL = process.env.SUNO_BASE_URL;
    const apiKey = process.env.SUNO_API_KEY;

    if (!baseURL || !apiKey) {
      throw new Error('SUNO_BASE_URL and SUNO_API_KEY must be set in environment variables');
    }

    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,  // 根据官方文档使用 Bearer token
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Generate a new music track
   * 根据官方文档: POST /api/v1/generate
   * Returns the taskId from kie.ai API
   */
  async generate(params: SunoGenerateParams): Promise<string> {
    try {
      const requestBody = {
        prompt: params.prompt,
        customMode: params.customMode ?? false,
        instrumental: params.instrumental ?? false,
        model: params.model || 'V3_5',
        callBackUrl: params.callBackUrl || 'https://example.com/callback',  // callBackUrl 是必需的
        ...(params.style && { style: params.style }),
        ...(params.title && { title: params.title }),
      };

      const response = await this.client.post<KieApiResponse<SunoTaskResponse>>(
        '/api/v1/generate',  // 根据官方文档的正确端点
        requestBody
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Generation failed');
      }

      return response.data.data.taskId;
    } catch (error) {
      console.error('Error generating music:', error);
      throw error;
    }
  }

  /**
   * Get status of a task by taskId
   * 根据官方文档: GET /api/v1/generate/record-info?taskId={taskId}
   */
  async getStatus(taskId: string): Promise<SunoTaskStatus> {
    try {
      const response = await this.client.get<KieApiResponse<SunoTaskStatus>>(
        `/api/v1/generate/record-info`,  // 根据官方文档的正确端点
        {
          params: { taskId }
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || 'Failed to get task status');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching task status:', error);
      throw error;
    }
  }

  /**
   * Get list of all tasks
   * 根据官方文档: GET /api/v1/generate/record-list
   */
  async listTasks(params?: { page?: number; pageSize?: number }): Promise<SunoTaskStatus[]> {
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
      console.error('Error fetching task list:', error);
      throw error;
    }
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
