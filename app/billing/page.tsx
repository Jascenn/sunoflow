'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import Link from 'next/link';
import {
    ChevronLeft, Coins, Crown, Check, Zap, Music, Clock, Shield,
    Sparkles, Star, Loader2, Gift, History, CreditCard, Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { LoadingPage, LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { useLanguage } from '@/components/providers/language-provider';
import { LanguageSwitcher } from '@/components/common/language-switcher';

// ----------------------------------------------------------------------
// Constants & Types
// ----------------------------------------------------------------------

interface Transaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
}

const MEMBERSHIP_PLANS: {
    id: string;
    name: string;
    price: number;
    priceLabel: string;
    period: string;
    badge?: string;
    features: { text: string; included: boolean; highlight?: boolean }[];
}[] = [
        {
            id: 'free',
            name: '免费版',
            price: 0,
            priceLabel: '¥0',
            period: '永久',
            features: [
                { text: '每日签到 10 积分', included: true },
                { text: '标准生成队列', included: true },
                { text: '基础音乐风格', included: true },
                { text: '最长 2 分钟音乐', included: true },
                { text: '同时生成 1 首', included: true },
                { text: '历史保留 30 天', included: true },
                { text: '高级音乐风格', included: false },
                { text: '商业授权', included: false },
            ],
        },
        {
            id: 'pro',
            name: '专业版',
            price: 29,
            priceLabel: '¥29',
            period: '/月',
            badge: '推荐',
            features: [
                { text: '每日签到 50 积分', included: true, highlight: true },
                { text: '优先生成队列', included: true, highlight: true },
                { text: '全部音乐风格', included: true, highlight: true },
                { text: '最长 4 分钟音乐', included: true, highlight: true },
                { text: '同时生成 3 首', included: true, highlight: true },
                { text: '历史永久保留', included: true, highlight: true },
                { text: '高级音乐风格', included: true, highlight: true },
                { text: '商业授权', included: true, highlight: true },
            ],
        },
    ];

const CREDIT_PACKAGES = [
    {
        id: 'credits_100',
        credits: 100,
        price: 9.9,
        priceLabel: '¥9.9',
        tag: null,
        description: '尝鲜体验',
        features: ['极速生成通道', '积分永不过期'],
        color: 'bg-stone-100',
        btnColor: 'bg-stone-900 text-white hover:bg-stone-800 shadow-stone-200',
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

// ----------------------------------------------------------------------
// Sub-Components
// ----------------------------------------------------------------------

function MembershipTab({ isPro }: { isPro: boolean }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSubscribe = async (planId: string) => {
        if (planId === 'free') return;
        try {
            setIsProcessing(true);
            setSelectedPlan(planId);

            // Try Stripe first
            try {
                const response = await axios.post('/api/stripe/checkout', { planId });
                if (response.data.url) {
                    window.location.href = response.data.url;
                    return;
                }
            } catch (stripeError) {
                console.warn('Stripe mock fallback for demo...');
                await axios.post('/api/membership', { planId });
                toast.success('订阅成功 (Mock)！', { description: '未配置 Stripe Keys，已使用模拟支付升级。' });
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            toast.error('订阅失败，请稍后重试');
        } finally {
            setIsProcessing(false);
            setSelectedPlan(null);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">选择您的会员计划</h2>
                <p className="text-stone-500">升级 PRO 享受优先队列、更多风格、商业授权等专属权益</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {MEMBERSHIP_PLANS.map((plan) => {
                    const isCurrent = (plan.id === 'free' && !isPro) || (plan.id === 'pro' && isPro);
                    const isProPlan = plan.id === 'pro';

                    return (
                        <div key={plan.id} className={cn("relative rounded-2xl overflow-hidden transition-all bg-white border", isProPlan ? "border-purple-200 shadow-xl shadow-purple-500/5 ring-1 ring-purple-200" : "border-stone-200")}>
                            {plan.badge && (
                                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold text-center py-1">
                                    <Star className="w-3 h-3 inline mr-1" />{plan.badge}
                                </div>
                            )}
                            <div className={cn("p-6", plan.badge && "pt-10")}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isProPlan ? "bg-purple-100 text-purple-600" : "bg-stone-100 text-stone-500")}>
                                            <Crown className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900">{plan.name}</h3>
                                            {isCurrent && <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">当前计划</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-stone-900">{plan.priceLabel}</div>
                                        <div className="text-xs text-stone-400">{plan.period}</div>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-2 text-sm">
                                            {feature.included ? (
                                                <Check className={cn("w-4 h-4", feature.highlight ? "text-purple-500" : "text-green-500")} />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border border-stone-200" />
                                            )}
                                            <span className={feature.included ? "text-stone-700" : "text-stone-400"}>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>

                                {isCurrent ? (
                                    <Button disabled className="w-full" variant="outline">当前计划</Button>
                                ) : isProPlan ? (
                                    <Button onClick={() => handleSubscribe(plan.id)} disabled={isProcessing} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                        {isProcessing && selectedPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                                        升级到 PRO
                                    </Button>
                                ) : (
                                    <Button variant="outline" className="w-full" disabled>免费使用</Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 p-8 max-w-4xl mx-auto">
                <h2 className="text-lg font-bold text-stone-900 mb-6 text-center">PRO 会员专属权益</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[{ icon: Zap, title: '优先队列', desc: '生成不排队' }, { icon: Music, title: '全部风格', desc: '解锁高级风格' }, { icon: Clock, title: '更长音乐', desc: '最长4分钟' }, { icon: Shield, title: '商业授权', desc: '可商用' }].map((b, i) => (
                        <div key={i} className="text-center">
                            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-2"><b.icon className="w-5 h-5 text-purple-500" /></div>
                            <h3 className="font-bold text-stone-900 text-sm">{b.title}</h3>
                            <p className="text-xs text-stone-500">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function RechargeTab() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPkg, setSelectedPkg] = useState<string | null>(null);

    const handleRecharge = async (pkgId: string) => {
        try {
            setIsProcessing(true);
            setSelectedPkg(pkgId);
            await axios.post('/api/recharge', { packageId: pkgId });
            toast.success('充值成功！', { description: '积分已到账。' });
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: unknown) {
            const errorMessage = axios.isAxiosError(error) ? error.response?.data?.error : '请稍后重试';
            toast.error('充值失败', { description: errorMessage });
        } finally {
            setIsProcessing(false);
            setSelectedPkg(null);
        }
    };

    return (
        <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-stone-900 mb-2">充值积分</h2>
                <p className="text-stone-500 flex items-center justify-center gap-2"><Sparkles className="w-3 h-3" /> 积分用于生成音乐 · 永久有效 · 不随会员过期</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {CREDIT_PACKAGES.map((pkg) => (
                    <div key={pkg.id} className={cn("relative rounded-2xl p-6 transition-all duration-300 bg-white border flex flex-col hover:shadow-lg hover:-translate-y-1", pkg.highlight ? "border-purple-200 shadow-lg ring-1 ring-purple-100" : "border-stone-200")}>
                        {pkg.tag && <div className="absolute top-4 right-4 px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600">{pkg.tag}</div>}
                        <div className="mb-6">
                            <h3 className="text-stone-500 font-bold text-xs uppercase tracking-wider mb-2">{pkg.description}</h3>
                            <div className="text-3xl font-bold text-stone-900 flex items-baseline gap-1">{pkg.credits}<span className="text-sm text-stone-400">积分</span></div>
                        </div>
                        <ul className="space-y-2 mb-8 flex-1">
                            {pkg.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-stone-600"><Check className="w-3 h-3 text-stone-400" />{f}</li>
                            ))}
                        </ul>
                        <div className="mt-auto border-t border-stone-100 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xl font-bold text-stone-900">{pkg.priceLabel}</span>
                            </div>
                            <Button onClick={() => handleRecharge(pkg.id)} disabled={isProcessing} className={cn("w-full font-bold", pkg.btnColor)}>
                                {isProcessing && selectedPkg === pkg.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "立即充值"}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 border-t border-stone-200 pt-8 text-center text-sm text-stone-400 flex justify-center gap-8">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> 安全支付</span>
                <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> 秒级到账</span>
                <span className="flex items-center gap-1"><Gift className="w-3 h-3" /> 失败退款</span>
            </div>
        </div>
    );
}

function TransactionsTab() {
    const { t } = useLanguage();
    const { data, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: async () => (await axios.get('/api/transactions')).data,
    });

    if (isLoading) return <LoadingSpinner className="py-12" />;

    const history = data?.history || [];

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-stone-900 mb-6">交易记录</h2>
            {history.length > 0 ? (
                <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 shadow-sm">
                    {history.map((tx: Transaction) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-stone-50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center bg-stone-100", tx.type === 'RECHARGE' ? "text-green-600 bg-green-50" : "text-stone-500")}>
                                    {tx.type === 'RECHARGE' ? <Coins className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="font-bold text-stone-900">{tx.type === 'RECHARGE' ? '积分充值' : tx.type === 'SUBSCRIPTION' ? '会员订阅' : tx.type}</div>
                                    <div className="text-xs text-stone-500">{new Date(tx.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={cn("font-bold", tx.amount > 0 ? "text-green-600" : "text-stone-900")}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount} 积分
                                </div>
                                {tx.status === 'COMPLETED' && <div className="text-xs text-stone-400">已完成</div>}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    icon={History}
                    title="暂无交易记录"
                    description={t('billing.history.empty')}
                    className="bg-white rounded-xl border border-stone-200"
                />
            )}
        </div>
    );
}

// ----------------------------------------------------------------------
// Main Page Component
// ----------------------------------------------------------------------

export default function BillingPage() {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<'plans' | 'recharge' | 'history'>('plans');

    // Fetch unified data to show balance/status in header
    const { data: walletData } = useQuery({
        queryKey: ['wallet'],
        queryFn: async () => (await axios.get('/api/wallet')).data,
        enabled: !!user,
    });
    const { data: membershipData } = useQuery({
        queryKey: ['membership'],
        queryFn: async () => {
            try { return (await axios.get('/api/membership')).data; } catch { return { tier: 'FREE' }; }
        },
        enabled: !!user,
    });

    if (!isLoaded) return <LoadingPage />;

    const isPro = membershipData?.tier === 'PRO';
    const balance = walletData?.wallet?.balance ?? 0;

    return (
        <div className="min-h-screen bg-stone-50/50 font-sans">
            <header className="sticky top-0 z-20 bg-white/80 border-b border-stone-200 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-medium transition-colors group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="hidden sm:inline">返回控制台</span>
                        <span className="sm:hidden">返回</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <LanguageSwitcher variant="ghost" />
                        <div className="flex items-center gap-2 text-sm text-stone-600">
                            账户余额: <span className="font-bold text-stone-900">{balance}</span> 积分
                        </div>
                        {isPro && <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Crown className="w-3 h-3" /> PRO</div>}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
                <div className="flex justify-center mb-10 overflow-x-auto pb-2 -mx-4 px-4 md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
                    <div className="bg-white p-1 rounded-xl border border-stone-200 shadow-sm inline-flex shrink-0">
                        <button onClick={() => setActiveTab('plans')} className={cn("px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap", activeTab === 'plans' ? "bg-stone-900 text-white shadow" : "text-stone-500 hover:text-stone-900")}>
                            会员订阅
                        </button>
                        <button onClick={() => setActiveTab('recharge')} className={cn("px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap", activeTab === 'recharge' ? "bg-stone-900 text-white shadow" : "text-stone-500 hover:text-stone-900")}>
                            积分充值
                        </button>
                        <button onClick={() => setActiveTab('history')} className={cn("px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap", activeTab === 'history' ? "bg-stone-900 text-white shadow" : "text-stone-500 hover:text-stone-900")}>
                            交易记录
                        </button>
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {activeTab === 'plans' && <MembershipTab isPro={isPro} />}
                    {activeTab === 'recharge' && <RechargeTab />}
                    {activeTab === 'history' && <TransactionsTab />}
                </div>
            </main>
        </div>
    );
}
