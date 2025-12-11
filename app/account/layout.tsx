'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

interface AccountLayoutProps {
    children: React.ReactNode;
}

// Simple passthrough layout - just render children
// /account will redirect to /account/billing
export default function AccountLayout({ children }: AccountLayoutProps) {
    return <>{children}</>;
}
