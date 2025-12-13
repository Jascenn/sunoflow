import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';
import { SunoGenerateParams } from './types/suno';

// --- Types ---

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    details?: string;
}

export interface GenerateMusicResponse {
    success: boolean;
    taskId: string;
    sunoTaskId: string;
    balance: number;
}

export interface SyncStats {
    created: number;
    updated: number;
}

export interface SyncTasksResponse {
    success: boolean;
    stats: SyncStats;
}

export interface WalletData {
    wallet: {
        balance: number;
        version: number;
    };
}

export interface ExploreData {
    success: boolean;
    data: any[]; // Consider using SunoMusicData[] if imports allow
    error?: string;
}

// --- Client ---

// Create an axios instance for consistency
const client = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Generic error handler
const handleError = (error: unknown, title: string = 'Operation failed') => {
    console.error(`${title}:`, error);

    let message = 'An unexpected error occurred';
    let description = '';

    if (error instanceof AxiosError && error.response) {
        const data = error.response.data;
        message = data.error || message;
        description = data.details || error.message;

        // Special handling for 402 (Payment Required)
        if (error.response.status === 402) {
            toast.error('Insufficient Credits', {
                description: 'Please upgrade your plan or top up to continue.',
                action: {
                    label: 'Top Up',
                    onClick: () => window.location.href = '/billing',
                },
            });
            return;
        }

        // Special handling for 429 (Too Many Requests / Limits)
        if (error.response.status === 429) {
            message = 'Limit Reached';
            description = data.details || 'Too many concurrent tasks.';
        }
    } else if (error instanceof Error) {
        description = error.message;
    }

    toast.error(title, {
        description: description || message,
    });

    throw error; // Re-throw for component-specific handling if needed
};

export const apiClient = {
    /**
     * Generate music using Suno API
     */
    generateMusic: async (params: SunoGenerateParams): Promise<GenerateMusicResponse> => {
        try {
            const response = await client.post<GenerateMusicResponse>('/api/generate', params);
            return response.data;
        } catch (error) {
            handleError(error, 'Generation failed');
            throw error;
        }
    },

    /**
     * Sync tasks from Suno API
     */
    syncTasks: async (): Promise<SyncTasksResponse> => {
        try {
            const response = await client.post<SyncTasksResponse>('/api/sync-tasks');
            return response.data;
        } catch (error) {
            handleError(error, 'Sync failed');
            throw error;
        }
    },

    /**
     * Get wallet balance
     */
    getWallet: async (): Promise<WalletData> => {
        try {
            const response = await client.get<WalletData>('/api/wallet');
            return response.data;
        } catch (error) {
            // Quietly fail or log for wallet fetch
            console.error('Failed to fetch wallet:', error);
            throw error;
        }
    },

    /**
     * Get explore feed
     */
    getExploreFeed: async (page: number = 1): Promise<any[]> => {
        try {
            const response = await client.get(`/api/explore?page=${page}`);
            if (response.data.success) {
                return response.data.data;
            }
            throw new Error(response.data.error || 'Failed to load feed');
        } catch (error) {
            // Explore feed errors might not need a toast if it's just initial load
            console.error('Explore feed error:', error);
            throw error;
        }
    }
};
