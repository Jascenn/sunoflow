'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /account to Dashboard
export default function AccountPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard');
    }, [router]);

    return null;
}
