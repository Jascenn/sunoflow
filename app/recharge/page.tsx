'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { toast } from 'sonner';
import { ChevronLeft, Coins, Zap, Check, Loader2, Sparkles, Gift, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/components/providers/language-provider';

const creditPackages = [
    {
        id: 'credits_100',
        credits: 100,
        price: 9.9,
        priceLabel: '¥9.9',
        tag: null,
        description: '尝鲜体验',
        features: ['极速生成通道', '积分永不过期'],
        color: 'bg-stone-100',
        btnColor: 'bg-white border-stone-200 text-stone-900 hover:bg-stone-50',
    },
    {
        id: 'credits_500',
        credits: 500,
        price: 39.9,
        priceLabel: '¥39.9',
        tag: '热门',
        highlight: true,
        description: '创作首选',
        features: ['极速生成通道', '积分永不过期', '支持商用授权'],
        color: 'bg-purple-50',
        btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
    {
        id: 'credits_2000',
        credits: 2000,
        price: 139.9,
        priceLabel: '¥139.9',
        tag: '推荐',
        description: '专业制作',
        features: ['极速生成通道', '积分永不过期', '支持商用授权', '优先客服支持'],
        color: 'bg-blue-50',
        btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    {
        id: 'credits_5000',
        credits: 5000,
        price: 299.9,
        priceLabel: '¥299.9',
        tag: '超值',
        description: '工作室版',
        features: ['极速生成通道', '积分永不过期', '支持商用授权', '专属客户经理'],
        color: 'bg-orange-50',
        btnColor: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
];

export default function RechargePage() {
    const { user, isLoaded } = useUser();
    const { t } = useLanguage();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

    // Fetch wallet data
    const { data: walletData } = useQuery({
        queryKey: ['wallet'],
        queryFn: async () => {
            const res = await axios.get('/api/wallet');
            return res.data;
        },
        enabled: !!user,
    });

    // Fetch membership status for badge
    const { data: membershipData } = useQuery({
        queryKey: ['membership'],
        queryFn: async () => {
            const res = await axios.get('/api/membership');
            return res.data;
        },
        enabled: !!user,
    });

    const isPro = membershipData?.tier === 'PRO' && membershipData?.isActive;
    const balance = walletData?.wallet?.balance ?? 0;

    const handleRecharge = async (pkgId: string) => {
        try {
            setIsProcessing(true);
            setSelectedPkg(pkgId);

            await axios.post('/api/recharge', { packageId: pkgId });

            toast.success('充值成功！', {
                description: '积分已到账。',
            });

            // Redirect to success page to match previous flow
            window.location.href = '/payment/success';

        } catch (error: any) {
            console.error('Recharge error:', error);
            toast.error('充值失败', {
                description: error.response?.data?.error || error.message || '请稍后重试',
            });
        } finally {
            setIsProcessing(false);
            setSelectedPkg(null);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50/50 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-20 bg-white/80 border-b border-stone-200 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        返回
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 bg-white border border-stone-200 text-stone-900 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span>{balance} 积分</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-16">
                    <h1 className="text-3xl font-bold text-stone-900 mb-3 tracking-tight">充值积分</h1>
                    <div className="flex items-center justify-center gap-2 text-stone-500">
                        <Sparkles className="w-4 h-4" />
                        <p className="text-base font-medium">积分用于生成音乐 · 永久有效 · 不随会员过期</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {creditPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className={cn(
                                "relative rounded-2xl p-6 transition-all duration-300",
                                pkg.highlight
                                    ? "ring-2 ring-purple-500/20 shadow-xl shadow-purple-500/5 translate-y-[-4px]"
                                    : "border border-stone-200 hover:shadow-lg hover:-translate-y-1",
                                "bg-white flex flex-col"
                            )}
                        >
                            {pkg.tag && (
                                <div className={cn(
                                    "absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase",
                                    pkg.highlight ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"
                                )}>
                                    {pkg.tag}
                                </div>
                            )}

                            <div className="mb-6 pt-2">
                                <h3 className="text-stone-500 font-bold text-sm mb-3 uppercase tracking-wider">{pkg.description}</h3>
                                <div className="text-4xl font-bold text-stone-900 flex items-baseline gap-1 mb-1 tracking-tight">
                                    {pkg.credits}
                                    <span className="text-base font-bold text-stone-400">积分</span>
                                </div>
                            </div>

                            <div className="flex-1">
                                <ul className="space-y-3 mb-8">
                                    {pkg.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
                                            <Check className={cn("w-4 h-4 shrink-0 mt-0.5", pkg.highlight ? "text-purple-600" : "text-stone-400")} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-auto pt-6 border-t border-stone-100">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-2xl font-bold text-stone-900">{pkg.priceLabel}</span>
                                    <span className="text-xs text-stone-400 line-through">¥{Math.round(pkg.price * 1.5)}</span>
                                </div>

                                <Button
                                    onClick={() => handleRecharge(pkg.id)}
                                    disabled={isProcessing}
                                    className={cn("w-full h-12 rounded-xl text-base font-bold shadow-sm transition-all active:scale-95", pkg.btnColor)}
                                >
                                    {isProcessing && selectedPkg === pkg.id ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        "立即充值"
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="mt-16 border-t border-stone-100 pt-10 text-center">
                    <div className="inline-flex items-center gap-8 text-stone-400 text-sm">
                        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> 官方正版接口</span>
                        <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> 秒级到账</span>
                        <span className="flex items-center gap-2"><Gift className="w-4 h-4" /> 失败自动退款</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
