'use client';

import Link from 'next/link';
import { Check, CreditCard, Zap, History, Crown, TrendingUp, Gift, Music, ArrowRight, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/components/providers/language-provider';

interface BillingContentProps {
    balance: number;
    isPro: boolean;
    transactions: any[];
}

// Mock usage data
const mockUsage = {
    used: 1250,
    total: 2500,
    daysLeft: 22,
};

// Transaction type icons
const txIcons: Record<string, any> = {
    RECHARGE: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100' },
    CONSUME: { icon: Music, color: 'text-purple-600', bg: 'bg-purple-100' },
    REWARD: { icon: Gift, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    REFUND: { icon: ArrowRight, color: 'text-blue-600', bg: 'bg-blue-100' },
};

export function BillingContent({ balance, isPro, transactions }: BillingContentProps) {
    const { t } = useLanguage();
    const usagePercent = Math.round((mockUsage.used / mockUsage.total) * 100);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold mb-1">{t('billing.title')}</h1>
                <p className="text-sm text-gray-500">{t('billing.subtitle')}</p>
            </div>

            {/* Three Column Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Credits Balance Card */}
                <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-6 relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-yellow-200/30 rounded-full blur-2xl"></div>
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <Coins className="w-5 h-5 text-yellow-500" />
                            </div>
                            <span className="text-sm font-medium text-amber-700">{t('billing.credit_balance')}</span>
                        </div>
                        <div className="text-4xl font-bold text-gray-900 mb-1">{balance.toLocaleString()}</div>
                        <div className="text-xs text-amber-600 mb-6">{t('billing.available_credits')}</div>
                        <Link href="/recharge">
                            <button className="w-full bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                {t('dashboard.top_up')}
                            </button>
                        </Link>
                    </div>
                </div>

                {/* 2. Membership Card */}
                <div className={cn(
                    "rounded-xl border p-6 relative overflow-hidden",
                    isPro ? "border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50" : "border-gray-200 bg-white"
                )}>
                    {isPro && <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-200/30 rounded-full blur-2xl"></div>}
                    <div className="relative">
                        <div className="flex items-center gap-2 mb-4">
                            <div className={cn(
                                "w-10 h-10 rounded-full shadow-sm flex items-center justify-center",
                                isPro ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gray-100"
                            )}>
                                <Crown className={cn("w-5 h-5", isPro ? "text-white" : "text-gray-400")} />
                            </div>
                            <div>
                                <span className={cn("text-sm font-medium", isPro ? "text-purple-700" : "text-gray-500")}>
                                    {isPro ? t('billing.plan.pro') : t('billing.plan.free')}
                                </span>
                                {isPro && <Zap className="w-3 h-3 text-yellow-500 inline ml-1 fill-yellow-500" />}
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {isPro ? '$10' : '$0'}
                            <span className="text-sm font-normal text-gray-500 ml-1">{t('billing.price.month')}</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-6">
                            {isPro ? t('billing.plan.pro.desc') : t('billing.plan.free.desc')}
                        </div>
                        <button className={cn(
                            "w-full py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2",
                            isPro
                                ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                        )}>
                            {isPro ? t('billing.btn.active') : t('billing.btn.upgrade')}
                        </button>
                    </div>
                </div>

                {/* 3. Usage Stats Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 shadow-sm flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">本月使用</span>
                    </div>
                    <div className="text-4xl font-bold text-gray-900 mb-1">{mockUsage.used.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 mb-4">/ {mockUsage.total.toLocaleString()} 积分</div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all",
                                    usagePercent > 80 ? "bg-red-500" : usagePercent > 50 ? "bg-yellow-500" : "bg-green-500"
                                )}
                                style={{ width: `${usagePercent}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1.5 text-[10px] text-gray-400">
                            <span>{usagePercent}% 已使用</span>
                            <span>剩余 {mockUsage.daysLeft} 天</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <section className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-gray-500" />
                        <h2 className="text-lg font-bold">{t('billing.history.title')}</h2>
                    </div>
                    <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        查看全部 <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 font-medium">{t('billing.history.type')}</th>
                                <th className="px-4 py-3 font-medium">描述</th>
                                <th className="px-4 py-3 font-medium text-right">{t('billing.history.amount')}</th>
                                <th className="px-4 py-3 font-medium">{t('billing.history.date')}</th>
                                <th className="px-4 py-3 font-medium">{t('billing.history.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions && transactions.length > 0 ? (
                                transactions.slice(0, 5).map((tx) => {
                                    const txType = txIcons[tx.type] || txIcons.CONSUME;
                                    const IconComponent = txType.icon;
                                    return (
                                        <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", txType.bg)}>
                                                    <IconComponent className={cn("w-4 h-4", txType.color)} />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-900">{tx.description || tx.type}</td>
                                            <td className={cn(
                                                "px-4 py-3 font-semibold text-right",
                                                tx.amount > 0 ? 'text-green-600' : 'text-gray-900'
                                            )}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                    <Check className="w-3 h-3" /> 完成
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <History className="w-8 h-8 text-gray-300" />
                                            <span>{t('billing.history.empty')}</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
