'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

export function AuthSync() {
    const { isSignedIn, userId } = useAuth();
    const { user } = useUser();
    const syncedUserId = useRef<string | null>(null);

    useEffect(() => {
        // Only sync if signed in and user data is loaded
        if (isSignedIn && userId && user && syncedUserId.current !== userId) {
            console.log('🔄 [AuthSync] Detected new user login, syncing with DB...');

            apiClient.syncUser()
                .then((data) => {
                    console.log('✅ [AuthSync] Sync success:', data);
                    syncedUserId.current = userId; // Mark as synced
                })
                .catch((err) => {
                    console.error('❌ [AuthSync] Sync failed:', err);
                    // Retry logic could go here, but for now simple logging
                });
        }
    }, [isSignedIn, userId, user]);

    return null; // This component renders nothing
}
