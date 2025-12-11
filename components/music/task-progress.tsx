'use client';

interface TaskProgressProps {
    status: string;
    progress?: string | null;
}

export function TaskProgress({ status, progress }: TaskProgressProps) {
    // Parse progress logic
    const getPercentage = (p?: string | null) => {
        if (!p) return 0;
        // Handle "50%", "50", "0.5" etc if needed. Assuming "50%" or "50" from API.
        const num = parseFloat(p);
        if (isNaN(num)) return 0;
        // If < 1, might be decimal (0.5 = 50%), but Suno API typically returns percentage string or readable string.
        // Let's assume the API returns reasonable string or number.
        return num > 100 ? 100 : num;
    };

    const percentage = getPercentage(progress);

    return (
        <div className="mt-3 w-full">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 animate-pulse">
                    {status === 'PENDING' ? '等待处理...' : 'AI 正在创作中...'}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                    {progress || '0%'}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
