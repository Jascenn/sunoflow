
import { stripe } from "@/lib/stripe";

export const runtime = 'edge';
import { headers } from "next/headers";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import Stripe from "stripe";


export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any;

        if (!session?.metadata?.internalId) {
            return new NextResponse("User id is required", { status: 400 });
        }

        // Update user to PRO
        await prisma.user.update({
            where: {
                id: session.metadata.internalId,
            },
            data: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,
                membershipTier: 'PRO',
                membershipExpiresAt: new Date(subscription.current_period_end * 1000),
            },
        });

        // Create subscription record
        await prisma.subscription.create({
            data: {
                id: crypto.randomUUID(),
                userId: session.metadata.internalId,
                tier: 'PRO',
                status: subscription.status,
                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                stripeSubscriptionId: subscription.id,
            }
        })
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any;

        // Update expiry on renewal
        await prisma.user.updateMany({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                membershipTier: 'PRO',
                membershipExpiresAt: new Date(subscription.current_period_end * 1000),
            },
        });
    }

    // Handle cancellation/expiration
    if (event.type === 'customer.subscription.deleted') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        ) as any;

        // Downgrade user
        await prisma.user.updateMany({
            where: {
                stripeSubscriptionId: subscription.id,
            },
            data: {
                membershipTier: 'FREE',
                membershipExpiresAt: null
            }
        })
    }

    return new NextResponse(null, { status: 200 });
}
