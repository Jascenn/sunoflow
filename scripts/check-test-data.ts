import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTestData() {
  try {
    console.log('🔍 Checking database connection...');

    // Check users
    const users = await prisma.user.findMany();
    console.log(`\n✅ Found ${users.length} users in database`);

    if (users.length > 0) {
      console.log('\n📋 User Details:');
      users.forEach(user => {
        console.log(`  - ${user.name || 'Unknown'} (${user.email})`);
        console.log(`    ID: ${user.id}`);
        console.log(`    Clerk ID: ${user.clerkId}`);
      });

      // Check tasks for each user
      for (const user of users) {
        const tasks = await prisma.task.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
        });

        console.log(`\n  📝 Tasks for ${user.name || user.email}: ${tasks.length}`);

        if (tasks.length > 0) {
          tasks.forEach(task => {
            console.log(`    - ${task.title || 'Untitled'}`);
            console.log(`      Status: ${task.status}`);
            console.log(`      Created: ${task.createdAt.toLocaleString()}`);
            if (task.parentAudioId) {
              console.log(`      Parent ID: ${task.parentAudioId}`);
            }
          });
        }

        // Check wallet
        const wallet = await prisma.wallet.findUnique({
          where: { userId: user.id },
        });

        if (wallet) {
          console.log(`  💰 Wallet balance: ${wallet.balance} credits`);
        } else {
          console.log(`  ⚠️  No wallet found for user`);
        }
      }
    } else {
      console.log('\n⚠️  No users found in database');
      console.log('You may need to log in first to create a user account.');
    }

  } catch (error) {
    console.error('❌ Error checking test data:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTestData();
