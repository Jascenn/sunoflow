import { LucideIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    iconClassName?: string; // For text/fill/stroke colors of the main icon
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    onClick,
    className,
    iconClassName,
}: EmptyStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-24 text-center px-4 animate-in fade-in zoom-in duration-500", className)}>
            <div
                className={cn(
                    "relative mb-8 group transition-transform hover:scale-105 duration-300",
                    onClick && "cursor-pointer"
                )}
                onClick={onClick}
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-violet-200/40 to-pink-200/40 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                {/* Main Icon Box */}
                <div className="relative w-24 h-24 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 flex items-center justify-center group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
                    <Icon className={cn("w-10 h-10 transition-colors", iconClassName || "text-stone-400")} />
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-4 top-0 bg-white p-2 rounded-2xl shadow-sm border border-stone-50 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-50" />
                </div>
                <div className="absolute -left-2 bottom-0 bg-white p-2 rounded-full shadow-sm border border-stone-50 animate-pulse">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                </div>
            </div>

            <h3 className="font-bold text-stone-900 text-xl mb-3 tracking-tight">
                {title}
            </h3>

            <p className="text-stone-500 max-w-xs mx-auto mb-8 leading-relaxed font-medium text-sm">
                {description}
            </p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
