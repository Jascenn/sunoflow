'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    Home,
    Music,
    Sparkles,
    Compass,
    Settings,
    LogOut,
    Plus,
    Github
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { LanguageSwitcher } from '@/components/common/language-switcher';

import { useLanguage } from '@/components/providers/language-provider';

// Removed static NAV_ITEMS
// Internal component with useSearchParams
function SidebarContent({ onSettingsClick }: { onSettingsClick: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { signOut } = useClerk();
    const { t } = useLanguage();

    const navItems = [
        { icon: Sparkles, label: t('sidebar.create'), href: '/dashboard', action: null },
        { icon: Compass, label: t('sidebar.explore'), href: '/explore', action: null },
        { icon: Music, label: t('sidebar.library'), href: '/dashboard?filter=all', action: null },
        { icon: Settings, label: t('sidebar.settings'), href: null, action: onSettingsClick },
    ];

    return (
        <div className="w-64 h-screen bg-stone-50 border-r border-stone-200 flex flex-col flex-shrink-0 font-sans text-stone-900 sticky top-0 left-0">
            {/* Header / User Switcher area */}
            <div className="p-4 h-16 flex items-center mb-4">
                <Link href="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">SunoFlow</span>
                </Link>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                {navItems.map((item, index) => {
                    let isActive = false;

                    if (item.href === '/dashboard') {
                        isActive = pathname === '/dashboard' && !searchParams.get('filter');
                    } else if (item.href?.includes('?filter=all')) {
                        isActive = pathname === '/dashboard' && searchParams.get('filter') === 'all';
                    } else if (item.href === '/explore') {
                        isActive = pathname === '/explore';
                    } else if (item.href) {
                        isActive = pathname === item.href;
                    }

                    const content = (
                        <>
                            <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-white" : "text-stone-400 group-hover:text-black")} />
                            <span>{item.label}</span>
                        </>
                    );

                    const className = cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                        isActive
                            ? "bg-black text-white shadow-sm"
                            : "text-stone-500 hover:bg-stone-200/50 hover:text-black"
                    );

                    if (item.action) {
                        return (
                            <button
                                key={`action-${index}`}
                                onClick={item.action}
                                className={cn(className, "w-full text-left")}
                            >
                                {content}
                            </button>
                        );
                    }

                    if (!item.href) return null;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={className}
                        >
                            {content}
                        </Link>
                    );
                })}

                {/* Section Divider */}
                <div className="mt-8 mb-2 px-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    {t('sidebar.favorites')}
                </div>

                {/* Favorites Link */}
                <Link
                    href="/dashboard?filter=favorites"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                        pathname === '/dashboard' && searchParams.get('filter') === 'favorites'
                            ? "bg-white text-black border border-stone-200 shadow-sm"
                            : "text-stone-500 hover:bg-stone-200/50 hover:text-black"
                    )}
                >
                    <span className="flex items-center justify-center w-4 h-4 text-xs">❤️</span>
                    <span>{t('sidebar.my_favorites')}</span>
                </Link>
            </div>

            {/* Footer / New Page */}
            <div className="p-4 border-t border-stone-200 space-y-2">
                <LanguageSwitcher variant="sidebar" />
                <div
                    onClick={() => signOut()}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-200/50 hover:text-stone-900 rounded-lg cursor-pointer transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span>{t('sidebar.sign_out')}</span>
                </div>
            </div>
        </div>
    );
}

export function Sidebar({ onSettingsClick }: { onSettingsClick?: () => void } = {}) {
    return (
        <Suspense fallback={<div className="w-60 h-screen bg-[#fbfbfa] border-r border-gray-200" />}>
            <SidebarContent onSettingsClick={onSettingsClick || (() => { })} />
        </Suspense>
    );
}
