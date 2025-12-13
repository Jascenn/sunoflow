
import { stripe } from "@/lib/stripe";


import { headers } from "next/headers";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/utils";

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
    } catch (error: unknown) {
        const msg = getErrorMessage(error);
        return new NextResponse(`Webhook Error: ${msg}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Handle One-time Payments (Credits) and Subscriptions
    if (event.type === "checkout.session.completed") {

        // 1. Credit Recharge Handling
        if (session.metadata?.type === 'credit') {
            const userId = session.metadata.internalId;
            const packageId = session.metadata.packageId;

            if (!userId || !packageId) {
                return new NextResponse("Missing metadata", { status: 400 });
            }

            // Define packages map (should ideally be shared constant)
            const PACKAGES: Record<string, number> = {
                'credits_100': 100,
                'credits_500': 500,
                'credits_2000': 2000,
                'credits_5000': 5000,
            };

            const credits = PACKAGES[packageId] || 0;

            if (credits > 0) {
                await prisma.$transaction(async (tx) => {
                    // Update Wallet
                    await tx.wallet.upsert({
                        where: { userId: userId },
                        create: {
                            userId: userId,
                            balance: credits,
                            version: 0
                        },
                        update: {
                            balance: { increment: credits }
                        }
                    });

                    // Create Transaction
                    await tx.transaction.create({
                        data: {
                            userId: userId,
                            amount: credits,
                            type: 'RECHARGE',
                            description: `Stripe Recharge: ${packageId}`,
                            // status: 'COMPLETED', // field doesn't exist in schema
                            // stripePaymentId: session.payment_intent // field doesn't exist in schema
                            referenceId: session.payment_intent as string // use referenceId instead
                        }
                    });
                });
                console.log(`[STRIPE] Recharge successful for user ${userId}: +${credits} credits`);
            }
        }
        // 2. Subscription Handling (Existing Logic)
        else if (session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                session.subscription as string
            );

            if (!session?.metadata?.internalId) {
                return new NextResponse("User id is required", { status: 400 });
            }

            await prisma.user.update({
                where: { id: session.metadata.internalId },
                data: {
                    stripeSubscriptionId: subscription.id,
                    stripeCustomerId: subscription.customer as string,
                    membershipTier: 'PRO',
                    membershipExpiresAt: new Date((subscription as any).current_period_end * 1000),
                },
            });

            // Upsert subscription to avoid unique constraint error
            await prisma.subscription.upsert({
                where: { userId: session.metadata.internalId },
                create: {
                    userId: session.metadata.internalId,
                    tier: 'PRO',
                    status: subscription.status,
                    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    stripeSubscriptionId: subscription.id,
                },
                update: {
                    tier: 'PRO',
                    status: subscription.status,
                    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                    stripeSubscriptionId: subscription.id,
                }
            });
        }
    }

    // Handle Subscription Renewal
    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscription.id },
            data: {
                membershipTier: 'PRO',
                membershipExpiresAt: new Date((subscription as any).current_period_end * 1000),
            },
        });
    }

    // Handle Billing Meter Error (Logging)
    if ((event.type as any) === "v1.billing.meter.error_report_triggered") {
        console.warn("[STRIPE] Meter Error Triggered:", (event.data.object as any));
        // Usually requires no immediate action but good to log
    }

    // Acknowledgement for setup_intent (User Request)
    if (event.type === "setup_intent.created") {
        console.log("[STRIPE] Setup Intent Created:", event.data.object);
    }

    return new NextResponse(null, { status: 200 });
}
