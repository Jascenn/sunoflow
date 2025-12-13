'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Home, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>

                <h1 className="text-2xl font-bold text-stone-900 mb-2">支付成功！</h1>
                <p className="text-stone-500 mb-8">
                    您的订单已完成，权益已即时到账。
                    <br />
                    感谢您的支持。
                </p>

                <div className="space-y-3">
                    <Link href="/dashboard" className="block">
                        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-6">
                            <Home className="w-4 h-4 mr-2" />
                            返回控制台
                        </Button>
                    </Link>
                    <Link href="/billing" className="block">
                        <Button variant="outline" className="w-full border-stone-200 hover:bg-stone-50 rounded-xl py-6">
                            继续充值
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
