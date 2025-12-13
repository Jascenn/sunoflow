import { ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900 py-12 md:py-24 px-6">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-black mb-10 transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8 border-b border-stone-100 pb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
                                <Shield className="w-3 h-3" />
                                Privacy Policy
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-2">Privacy Policy</h1>
                        </div>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Last Updated</div>
                            <div className="font-bold">Dec 13, 2024</div>
                        </div>
                    </div>

                    <div className="prose prose-stone prose-lg max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-stone-600 prose-a:text-blue-600 hover:prose-a:underline">
                        <p className="lead border-l-4 border-black pl-4 italic bg-stone-50 py-2 rounded-r-lg text-stone-700">
                            At SunoFlow, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
                        </p>

                        <h3>1. Information We Collect</h3>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, subscribe to our newsletter, or contact customer support. This may include your name, email address, and payment information.
                        </p>

                        <h3>2. How We Use Your Information</h3>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, to process your transactions, and to communicate with you about your account and our products.
                        </p>

                        <h3>3. Data Security</h3>
                        <p>
                            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption protocols.
                        </p>

                        <h3>4. Third-Party Services</h3>
                        <p>
                            We use trusted third-party services for payments (like Stripe) and authentication (like Clerk). We do not sell your personal data to advertisers.
                        </p>

                        <h3>5. Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@sunoflow.com">support@sunoflow.com</a>.
                        </p>
                    </div>
                </div>

                <div className="mt-8 text-center text-stone-400 text-sm">
                    © 2024 SunoFlow Inc. All rights reserved.
                </div>
            </div>
        </div>
    );
}
