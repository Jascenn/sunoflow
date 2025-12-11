import { prisma } from '@/lib/prisma';

export type MembershipTier = 'FREE' | 'PRO';

export interface MembershipStatus {
    tier: MembershipTier;
    isActive: boolean;
    expiresAt: Date | null;
    features: MembershipFeatures;
}

export interface MembershipFeatures {
    dailyCredits: number;
    priority: 'standard' | 'high';
    maxConcurrentGenerations: number;
    maxDuration: number; // in seconds
    allStyles: boolean;
    commercialLicense: boolean;
    historyRetention: number; // in days, -1 for forever
}

const TIER_FEATURES: Record<MembershipTier, MembershipFeatures> = {
    FREE: {
        dailyCredits: 10,
        priority: 'standard',
        maxConcurrentGenerations: 1,
        maxDuration: 120,
        allStyles: false,
        commercialLicense: false,
        historyRetention: 30,
    },
    PRO: {
        dailyCredits: 50,
        priority: 'high',
        maxConcurrentGenerations: 3,
        maxDuration: 240,
        allStyles: true,
        commercialLicense: true,
        historyRetention: -1,
    },
};

/**
 * Check user's membership status
 */
export async function getMembershipStatus(userId: string): Promise<MembershipStatus> {
    const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
            membershipTier: true,
            membershipExpiresAt: true,
        },
    });

    if (!user) {
        return {
            tier: 'FREE',
            isActive: false,
            expiresAt: null,
            features: TIER_FEATURES.FREE,
        };
    }

    const tier = (user.membershipTier as MembershipTier) || 'FREE';

    // Check if PRO is still active
    const isActive = tier === 'PRO' && user.membershipExpiresAt
        ? new Date() < user.membershipExpiresAt
        : tier === 'FREE';

    // If PRO expired, return FREE features
    const effectiveTier = isActive ? tier : 'FREE';

    return {
        tier: effectiveTier,
        isActive,
        expiresAt: user.membershipExpiresAt,
        features: TIER_FEATURES[effectiveTier],
    };
}

/**
 * Check if user has a specific feature
 */
export async function hasFeature(
    userId: string,
    feature: keyof MembershipFeatures
): Promise<boolean> {
    const status = await getMembershipStatus(userId);
    const value = status.features[feature];
    return typeof value === 'boolean' ? value : true;
}

/**
 * Get tier features without DB lookup
 */
export function getTierFeatures(tier: MembershipTier): MembershipFeatures {
    return TIER_FEATURES[tier];
}

/**
 * Check if user can perform an action based on membership
 */
export async function canPerformAction(
    userId: string,
    action: 'generate' | 'use_style' | 'commercial'
): Promise<{ allowed: boolean; reason?: string }> {
    const status = await getMembershipStatus(userId);

    switch (action) {
        case 'generate':
            // Always allowed, just different priority
            return { allowed: true };

        case 'use_style':
            if (!status.features.allStyles) {
                return {
                    allowed: false,
                    reason: '升级到 PRO 解锁全部音乐风格'
                };
            }
            return { allowed: true };

        case 'commercial':
            if (!status.features.commercialLicense) {
                return {
                    allowed: false,
                    reason: '升级到 PRO 获得商业授权'
                };
            }
            return { allowed: true };

        default:
            return { allowed: true };
    }
}
