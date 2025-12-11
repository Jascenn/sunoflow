'use client';

import Link from 'next/link';
import { useClerk, useUser } from '@clerk/nextjs';
import { useLanguage } from '@/components/providers/language-provider';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { X, User, Coins, Plus, LogOut, History, Crown } from 'lucide-react';

interface UserMenuPanelProps {
    onClose: () => void;
}



export function UserMenuPanel({ onClose }: UserMenuPanelProps) {
    const { signOut } = useClerk();
    const { user } = useUser();
    const { t } = useLanguage();

    // Fetch membership status
    const { data: membershipData } = useQuery({
        queryKey: ['membership'],
        queryFn: async () => {
            const res = await axios.get('/api/membership');
            return res.data;
        },
        enabled: !!user,
    });

    const isPro = membershipData?.tier === 'PRO' && membershipData?.isActive;

    // Fetch wallet data
    const { data: walletData } = useQuery({
        queryKey: ['wallet'],
        queryFn: async () => {
            try {
                const res = await axios.get('/api/wallet', { timeout: 3000 });
                return res.data;
            } catch (error) {
                return { wallet: { balance: 0 } };
            }
        },
        enabled: !!user,
        retry: 0,
    });

    const balance = walletData?.wallet?.balance ?? 0;

    // Fetch recent transactions
    const { data: transactionsData } = useQuery({
        queryKey: ['transactions', 'recent'],
        queryFn: async () => {
            const res = await axios.get('/api/transactions?limit=4');
            return res.data;
        },
        enabled: !!user,
    });

    const recentTransactions = transactionsData?.transactions || [];

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-900">{t('account.my_account')}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Account Info */}
                    <div className="flex items-center gap-4 mb-6">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-stone-200 flex-shrink-0">
                            {user?.imageUrl ? (
                                <img src={user.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-400">
                                    <User className="w-6 h-6" />
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 block truncate">
                                    {user?.firstName} {user?.lastName}
                                </span>
                                {isPro && (
                                    <div className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-gradient-to-r from-violet-100 to-indigo-100 text-indigo-700 border border-indigo-200">
                                        <Crown className="w-3 h-3 fill-current" />
                                        PRO
                                    </div>
                                )}
                            </div>
                            {/* Free User Tag if not PRO */}
                            {!isPro && (
                                <div className="text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded w-fit mt-1">
                                    普通会员
                                </div>
                            )}
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                {user?.emailAddresses?.[0]?.emailAddress}
                            </p>
                        </div>
                    </div>

                    {/* Upgrade Banner */}
                    {!isPro && (
                        <div className="mb-6 relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white shadow-lg">
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-sm flex items-center gap-1">
                                        <Crown className="w-4 h-4 text-yellow-300" />
                                        升级到 PRO 会员
                                    </h3>
                                    <p className="text-[10px] text-indigo-100 mt-0.5">解锁无限生成、商业授权等权益</p>
                                </div>
                                <Link href="/membership" onClick={onClose}>
                                    <button className="bg-white text-indigo-600 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors shadow-sm">
                                        立即升级
                                    </button>
                                </Link>
                            </div>
                            {/* Decor */}
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white opacity-10 rounded-full blur-xl" />
                            <div className="absolute bottom-0 left-0 -mb-2 -ml-2 w-12 h-12 bg-white opacity-10 rounded-full blur-xl" />
                        </div>
                    )}

                    {/* Credits Balance */}
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                                <Coins className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{balance.toLocaleString()}</div>
                                <div className="text-xs text-amber-600">{t('billing.available_credits')}</div>
                            </div>
                        </div>
                        <Link href="/membership" onClick={onClose}>
                            <button className="bg-black hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors">
                                <Plus className="w-3.5 h-3.5" /> {t('dashboard.top_up')}
                            </button>
                        </Link>
                    </div>

                    {/* Transaction History */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">{t('billing.history.title')}</span>
                            </div>
                            <Link href="/transactions" onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">
                                查看全部 →
                            </Link>
                        </div>
                        <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between py-2.5 px-3">
                                        <div>
                                            <div className="text-sm text-gray-900 truncate max-w-[150px]">{tx.description || '交易'}</div>
                                            <div className="text-[10px] text-gray-400">
                                                {new Date(tx.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className={tx.amount > 0 ? 'text-green-600 font-medium text-sm' : 'text-gray-600 text-sm'}>
                                            {tx.amount > 0 ? '+' : ''}{tx.amount}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-4 text-center text-xs text-gray-400">
                                    {t('billing.history.empty')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sign Out */}
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors border border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        {t('sidebar.sign_out')}
                    </button>
                </div>
            </div>
        </div>
    );
}
