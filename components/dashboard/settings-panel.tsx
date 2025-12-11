'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useLanguage } from '@/components/providers/language-provider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Sun, Moon, Monitor, Globe, Bell } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SettingsPanelProps {
    onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
    const { theme, setTheme } = useTheme();
    const { t, locale, setLocale } = useLanguage();
    const [taskNotifications, setTaskNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleThemeChange = (newTheme: string) => {
        setTheme(newTheme);
        toast.success(t('settings.notif_saved'));
    };

    const handleLanguageChange = (newLocale: 'en' | 'zh') => {
        setLocale(newLocale);
        toast.success(t('settings.notif_saved'));
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">{t('settings.title')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Theme */}
                    <div>
                        <Label className="text-xs font-medium text-gray-500 mb-3 block">{t('settings.appearance')}</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'light', icon: Sun, label: t('settings.light') },
                                { id: 'dark', icon: Moon, label: t('settings.dark') },
                                { id: 'system', icon: Monitor, label: t('settings.system') },
                            ].map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => mounted && handleThemeChange(mode.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-xs font-medium transition-all",
                                        (theme === mode.id || (!mounted && mode.id === 'system'))
                                            ? "border-black bg-black text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    )}
                                >
                                    <mode.icon className="w-4 h-4" />
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <div>
                        <Label className="text-xs font-medium text-gray-500 mb-3 block flex items-center gap-1">
                            <Globe className="w-3 h-3" /> {t('settings.language')}
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { id: 'en', label: 'English' },
                                { id: 'zh', label: '中文' },
                            ].map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => handleLanguageChange(lang.id as 'en' | 'zh')}
                                    className={cn(
                                        "px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                                        locale === lang.id
                                            ? "border-black bg-black text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    )}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Email Notifications */}
                    <div>
                        <Label className="text-xs font-medium text-gray-500 mb-3 block flex items-center gap-1">
                            <Bell className="w-3 h-3" /> {t('settings.email_notifications')}
                        </Label>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium block">{t('settings.task_completions')}</Label>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{t('settings.task_completions_desc')}</p>
                                </div>
                                <Switch
                                    checked={taskNotifications}
                                    onCheckedChange={(checked) => {
                                        setTaskNotifications(checked);
                                        toast.success(t('settings.notif_saved'));
                                    }}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <Label className="text-sm font-medium block">{t('settings.marketing_updates')}</Label>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{t('settings.marketing_updates_desc')}</p>
                                </div>
                                <Switch
                                    checked={marketingEmails}
                                    onCheckedChange={(checked) => {
                                        setMarketingEmails(checked);
                                        toast.success(t('settings.notif_saved'));
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
