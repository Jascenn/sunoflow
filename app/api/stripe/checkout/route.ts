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

        const { planId } = await req.json();

        if (!planId) {
            return new NextResponse("Plan ID required", { status: 400 });
        }

        // Get the price ID from env based on plan
        // Currently only supporting PRO plan
        const priceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

        if (!priceId) {
            console.error("Missing Stripe Price ID");
            return new NextResponse("Stripe configuration error", { status: 500 });
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

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: dbUser.stripeCustomerId!,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${settingsUrl}/membership?success=true`,
            cancel_url: `${settingsUrl}/membership?canceled=true`,
            metadata: {
                userId: userId,
                internalId: dbUser.id,
                planId: planId
            },
            subscription_data: {
                metadata: {
                    userId: userId,
                    internalId: dbUser.id
                }
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error) {
        console.error("[STRIPE_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
