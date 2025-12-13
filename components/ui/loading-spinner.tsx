import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
    className?: string;
    text?: string;
    size?: number;
}

export function LoadingSpinner({ className, text, size = 24 }: LoadingProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-3 p-8", className)}>
            <Loader2 className="animate-spin text-purple-600" size={size} />
            {text && <p className="text-sm text-gray-500 animate-pulse">{text}</p>}
        </div>
    );
}

export function LoadingPage() {
    return (
        <div className="flex h-full w-full items-center justify-center bg-white/50 backdrop-blur-sm">
            <LoadingSpinner text="Loading..." size={32} />
        </div>
    );
}
