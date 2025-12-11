import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const clerkId = 'user_36LD69lxNikvSvtZmH3WZT9cxja';

    console.log(`Checking for user ${clerkId}...`);

    try {
        // 1. Check if user exists
        let user = await prisma.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            console.log('User not found. Creating user...');
            user = await prisma.user.create({
                data: {
                    id: crypto.randomUUID(),
                    clerkId,
                    email: 'user@example.com', // Placeholder
                    name: 'Local User',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            });
            console.log('User created:', user.id);
        } else {
            console.log('User already exists:', user.id);
        }

        // 2. Check if wallet exists
        let wallet = await prisma.wallet.findUnique({
            where: { userId: user.id },
        });

        if (!wallet) {
            console.log('Wallet not found. Creating wallet...');
            wallet = await prisma.wallet.create({
                data: {
                    id: crypto.randomUUID(),
                    userId: user.id,
                    balance: 100, // Give 100 initial credits
                    version: 0,
                    updatedAt: new Date(),
                },
            });
            console.log('Wallet created with 100 credits.');
        } else {
            console.log('Wallet exists. Balance:', wallet.balance);
            // Optional: Top up if low
            if (wallet.balance < 10) {
                console.log('Balance low, topping up to 100...');
                await prisma.wallet.update({
                    where: { id: wallet.id },
                    data: { balance: 100, version: { increment: 1 } },
                });
            }
        }

        console.log('✅ Setup complete for user:', clerkId);
    } catch (error) {
        console.error('Error during seed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
