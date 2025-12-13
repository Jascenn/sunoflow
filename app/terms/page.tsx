import { ArrowLeft, Book } from 'lucide-react';
import Link from 'next/link';

export default function TermsPage() {
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
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-xs font-bold uppercase tracking-wider mb-4">
                                <Book className="w-3 h-3" />
                                Legal
                            </div>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-black mb-2">Terms of Service</h1>
                        </div>

                        <div className="text-right hidden sm:block">
                            <div className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Last Updated</div>
                            <div className="font-bold">Dec 13, 2024</div>
                        </div>
                    </div>

                    <div className="prose prose-stone prose-lg max-w-none prose-headings:font-bold prose-headings:text-black prose-p:text-stone-600 prose-a:text-purple-600 hover:prose-a:underline">
                        <p className="lead border-l-4 border-black pl-4 italic bg-stone-50 py-2 rounded-r-lg text-stone-700">
                            Please read these Terms of Service completely using SunoFlow which is owned and operated by SunoFlow Inc. This Agreement documents the legally binding terms and conditions attached to the use of the Site at sunoflow.com.
                        </p>

                        <h3>1. Acceptance of Terms</h3>
                        <p>
                            By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
                        </p>

                        <h3>2. Use License</h3>
                        <p>
                            Permission is granted to temporarily download one copy of the materials (information or software) on SunoFlow's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                        </p>

                        <h3>3. Content Generation & Ownership</h3>
                        <p>
                            Users own the commercial rights to the songs they generate if they are subscribed to a Pro Plan at the time of generation. Users on the Free Plan have only non-commercial rights. You must not use the service to generate content that is illegal, harmful, or violates the rights of others.
                        </p>

                        <h3>4. Billing & Refunds</h3>
                        <p>
                            Premium features are billed on a subscription basis. You may cancel your subscription at any time. We generally do not offer refunds solely for dissatisfaction with AI-generated outputs, as generation quality is subjective.
                        </p>

                        <h3>5. Disclaimer</h3>
                        <p>
                            The materials on SunoFlow's website are provided on an 'as is' basis. SunoFlow makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
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
