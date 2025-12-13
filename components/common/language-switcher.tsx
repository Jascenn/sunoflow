'use client';

import { useLanguage } from '@/components/providers/language-provider';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageSwitcher({ variant = 'default' }: { variant?: 'default' | 'ghost' | 'sidebar' }) {
    const { locale, setLocale } = useLanguage();

    const isSidebar = variant === 'sidebar';

    const toggleLanguage = () => {
        setLocale(locale === 'en' ? 'zh' : 'en');
    };

    if (isSidebar) {
        return (
            <div
                onClick={toggleLanguage}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-stone-500 hover:bg-stone-200/50 hover:text-stone-900 rounded-lg cursor-pointer transition-colors w-full select-none"
            >
                <Globe className="w-4 h-4" />
                <span>{locale === 'en' ? 'Language: English' : '语言：中文'}</span>
            </div>
        );
    }

    return (
        <Button
            variant={variant === 'ghost' ? 'ghost' : 'outline'}
            size="sm"
            className="gap-2 min-w-[60px]"
            onClick={toggleLanguage}
        >
            <Globe className="w-4 h-4" />
            <span>{locale === 'en' ? 'En' : '中'}</span>
        </Button>
    );
}
