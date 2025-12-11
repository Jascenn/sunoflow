'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'ghost' | 'sidebar' }) {
    const { locale, setLocale } = useLanguage();

    const isSidebar = variant === 'sidebar';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {isSidebar ? (
                    <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-200/50 hover:text-stone-900 rounded-lg cursor-pointer transition-colors w-full">
                        <Globe className="w-4 h-4" />
                        <span>{locale === 'en' ? 'English' : '中文'}</span>
                    </div>
                ) : (
                    <Button variant={variant === 'ghost' ? 'ghost' : 'outline'} size="sm" className="gap-2">
                        <Globe className="w-4 h-4" />
                        <span className="hidden sm:inline">{locale === 'en' ? 'En' : '中'}</span>
                    </Button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSidebar ? 'start' : 'end'}>
                <DropdownMenuItem onClick={() => setLocale('en')}>
                    🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocale('zh')}>
                    🇨🇳 中文 (Chinese)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
