'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, History, CreditCard, Music, Gift, ArrowRight, Filter, Download } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const txIcons: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    RECHARGE: { icon: CreditCard, color: 'text-green-600', bg: 'bg-green-100', label: '充值' },
    CONSUME: { icon: Music, color: 'text-purple-600', bg: 'bg-purple-100', label: '消费' },
    REWARD: { icon: Gift, color: 'text-yellow-600', bg: 'bg-yellow-100', label: '奖励' },
    REFUND: { icon: ArrowRight, color: 'text-blue-600', bg: 'bg-blue-100', label: '退款' },
};

type FilterType = 'all' | 'RECHARGE' | 'CONSUME' | 'REWARD' | 'REFUND';

export default function TransactionsPage() {
    const { t } = useLanguage();
    const [filter, setFilter] = useState<FilterType>('all');
    // Fetch transactions
    const { data, isLoading } = useQuery({
        queryKey: ['transactions', filter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('type', filter);
            const res = await fetch(`/api/transactions?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch transactions');
            return res.json();
        },
    });

    const transactions = data?.transactions || [];

    // Calculate summary from ALL transactions (not just filtered, or separate endpoint?)
    // For simplicity, we calculate from the fetched list for now, or we could add a stats endpoint.
    // Let's filter client-side for summary to be accurate if we fetched all? 
    // Actually, usually summary should be global. Let's keep it simple: 
    // Sum of currently displayed list for now, or remove summary if it's confusing.
    // The previous mock calculated from ALL. Let's calculate from the current list.
    const totalIn = transactions.filter((tx: any) => tx.amount > 0).reduce((sum: number, tx: any) => sum + tx.amount, 0);
    const totalOut = Math.abs(transactions.filter((tx: any) => tx.amount < 0).reduce((sum: number, tx: any) => sum + tx.amount, 0));

    return (
        <div className="min-h-screen bg-stone-50/50">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/90 border-b border-stone-100 backdrop-blur-xl">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        返回
                    </Link>
                    <button className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        导出
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-10">
                {/* Title */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center">
                        <History className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-stone-900">{t('billing.history.title')}</h1>
                        <p className="text-sm text-stone-500">查看您的所有积分变动记录</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-stone-200 p-4">
                        <p className="text-xs text-stone-400 mb-1">总收入</p>
                        <p className="text-2xl font-bold text-green-600">+{totalIn.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-stone-200 p-4">
                        <p className="text-xs text-stone-400 mb-1">总支出</p>
                        <p className="text-2xl font-bold text-stone-900">-{totalOut.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                            filter === 'all' ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        )}
                    >
                        全部
                    </button>
                    {Object.entries(txIcons).map(([key, value]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key as FilterType)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1",
                                filter === key ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                            )}
                        >
                            {value.label}
                        </button>
                    ))}
                </div>

                {/* Transaction List */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    {isLoading ? (
                        <div className="p-12 flex justify-center text-stone-400">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : transactions.length > 0 ? (
                        <div className="divide-y divide-stone-100">
                            {transactions.map((tx: any) => {
                                const txType = txIcons[tx.type] || txIcons.CONSUME;
                                const IconComponent = txType.icon;
                                return (
                                    <div key={tx.id} className="flex items-center gap-4 p-4 hover:bg-stone-50 transition-colors">
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", txType.bg)}>
                                            <IconComponent className={cn("w-5 h-5", txType.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-stone-900">{tx.description || t('billing.history.type')}</div>
                                            <div className="text-xs text-stone-400">
                                                {new Date(tx.createdAt).toLocaleDateString()} · {new Date(tx.createdAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "text-base font-bold",
                                            tx.amount > 0 ? 'text-green-600' : 'text-stone-900'
                                        )}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-stone-400">
                            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>{t('billing.history.empty')}</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
