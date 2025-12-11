'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw } from 'lucide-react';

export default function PaymentCancelPage() {
    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-8 h-8 text-red-600" />
                </div>

                <h1 className="text-2xl font-bold text-stone-900 mb-2">支付已取消</h1>
                <p className="text-stone-500 mb-8">
                    您取消了本次支付操作，账户未发生扣款。
                    <br />
                    如遇问题，请联系客服支持。
                </p>

                <div className="space-y-3">
                    <Link href="/recharge" className="block">
                        <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-6">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            重新尝试
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="block">
                        <Button variant="outline" className="w-full border-stone-200 hover:bg-stone-50 rounded-xl py-6">
                            <Home className="w-4 h-4 mr-2" />
                            返回首页
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
