export const runtime = "edge";

import { NextRequest, NextResponse } from 'next/server';


import { auth, currentUser } from '@clerk/nextjs/server';

import { prisma } from '@/lib/prisma';

import { stripe } from '@/lib/stripe';


export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const settingsUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || 'http://localhost:3000';

        // Check if user already has a stripe customer id
        let dbUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!dbUser) {
            // 1. Auto-create user if missing (Robustness fix)
            console.log("[STRIPE] User not found in DB, auto-creating...");
            dbUser = await prisma.user.create({
                data: {
                    clerkId: userId,
                    email: user.emailAddresses[0]?.emailAddress || '',
                    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                    avatarUrl: user.imageUrl,
                }
            });
        }

        // Create Stripe Customer if not exists
        if (!dbUser.stripeCustomerId) {
            const customer = await stripe.customers.create({
                email: user.emailAddresses[0].emailAddress,
                metadata: {
                    userId: userId,
                    internalId: dbUser.id
                }
            });

            dbUser = await prisma.user.update({
                where: { clerkId: userId },
                data: { stripeCustomerId: customer.id }
            });
        }

        // Determine Price and Mode
        const { type, packageId } = await req.json();

        let lineItems = [];
        let mode: 'payment' | 'subscription' = 'payment';

        if (type === 'credit') {
            // Credit Recharges (One-time payment)
            const PACKAGES: Record<string, { price: number, name: string }> = {
                'credits_100': { price: 990, name: '100 Credits' }, // price in cents
                'credits_500': { price: 3990, name: '500 Credits' },
                'credits_2000': { price: 13990, name: '2000 Credits' },
                'credits_5000': { price: 29990, name: '5000 Credits' },
            };

            const pkg = PACKAGES[packageId];
            if (!pkg) return new NextResponse("Invalid package", { status: 400 });

            lineItems = [{
                price_data: {
                    currency: 'cny',
                    product_data: {
                        name: pkg.name,
                        description: `Recharge ${pkg.name.split(' ')[0]} AI generation credits`,
                    },
                    unit_amount: pkg.price,
                },
                quantity: 1,
            }];
            mode = 'payment';
        } else {
            // Subscriptions (Existing logic, but simplified to avoid ID dependency if needed)
            return new NextResponse("Subscription not implemented in this demo mode", { status: 400 });
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: dbUser.stripeCustomerId!,
            line_items: lineItems,
            mode: mode,
            success_url: `${settingsUrl}/billing?success=true`, // Redirect back to billing
            cancel_url: `${settingsUrl}/billing?canceled=true`,
            metadata: {
                userId: userId,
                internalId: dbUser.id,
                type: type,
                packageId: packageId
            },
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT]", error?.message || error);
        return new NextResponse(`Stripe Error: ${error?.message}`, { status: 500 });
    }
}
