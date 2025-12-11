import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Get the existing user (created via Clerk sync)
  const existingUser = await prisma.user.findFirst();

  if (!existingUser) {
    console.log('❌ No user found. Please sign up and sync your account first.');
    return;
  }

  console.log(`✅ Found user: ${existingUser.email}`);

  // Add some test transactions
  console.log('📝 Creating test transactions...');

  const transactions = [
    {
      userId: existingUser.id,
      amount: 50,
      type: 'RECHARGE',
      description: '充值 50 积分',
    },
    {
      userId: existingUser.id,
      amount: -5,
      type: 'CONSUME',
      description: '生成音乐：夏日海滩氛围音乐',
    },
    {
      userId: existingUser.id,
      amount: -5,
      type: 'CONSUME',
      description: '生成音乐：赛博朋克风格电子音乐',
    },
    {
      userId: existingUser.id,
      amount: -5,
      type: 'CONSUME',
      description: '生成音乐：轻松的爵士咖啡馆背景音乐',
    },
    {
      userId: existingUser.id,
      amount: 100,
      type: 'RECHARGE',
      description: '充值 100 积分',
    },
    {
      userId: existingUser.id,
      amount: -5,
      type: 'CONSUME',
      description: '生成音乐：史诗级交响乐',
    },
  ];

  for (const txData of transactions) {
    await prisma.transaction.create({ data: txData });
  }
  console.log(`✅ Created ${transactions.length} transactions`);

  // Update wallet balance
  console.log('💰 Updating wallet balance...');
  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  await prisma.wallet.update({
    where: { userId: existingUser.id },
    data: {
      balance: {
        increment: totalAmount,
      },
    },
  });
  console.log(`✅ Wallet balance updated (+${totalAmount} credits)`);

  // Create some test tasks
  console.log('🎵 Creating test tasks...');

  const tasks = [
    {
      userId: existingUser.id,
      sunoTaskId: 'test-task-001',
      prompt: '夏日海滩氛围音乐，轻松愉快的旋律，海浪声作为背景',
      tags: '海滩, 轻松, 氛围音乐',
      model: 'chirp-v3-5',
      status: 'COMPLETED',
      title: 'Summer Beach Vibes',
      audioUrl: 'https://cdn.suno.ai/example-beach.mp3',
      imageUrl: 'https://cdn.suno.ai/example-beach.jpg',
      duration: 180.5,
    },
    {
      userId: existingUser.id,
      sunoTaskId: 'test-task-002',
      prompt: '赛博朋克风格电子音乐，充满未来感的合成器音色',
      tags: '赛博朋克, 电子, 未来感',
      model: 'chirp-v3-5',
      status: 'COMPLETED',
      title: 'Cyberpunk Dreams',
      audioUrl: 'https://cdn.suno.ai/example-cyber.mp3',
      imageUrl: 'https://cdn.suno.ai/example-cyber.jpg',
      duration: 200.8,
    },
    {
      userId: existingUser.id,
      sunoTaskId: 'test-task-003',
      prompt: '轻松的爵士咖啡馆背景音乐，钢琴和萨克斯风',
      tags: '爵士, 咖啡馆, 轻松',
      model: 'chirp-v3-5',
      status: 'COMPLETED',
      title: 'Jazz Cafe Afternoon',
      audioUrl: 'https://cdn.suno.ai/example-jazz.mp3',
      imageUrl: 'https://cdn.suno.ai/example-jazz.jpg',
      duration: 240.2,
    },
    {
      userId: existingUser.id,
      sunoTaskId: 'test-task-004',
      prompt: '史诗级交响乐，气势磅礴的管弦乐编排',
      tags: '交响乐, 史诗, 古典',
      model: 'chirp-v3-5',
      status: 'PROCESSING',
      title: 'Epic Symphony',
      duration: 0,
    },
    {
      userId: existingUser.id,
      sunoTaskId: null,
      prompt: '中国风古典音乐，使用古筝和二胡',
      tags: '中国风, 古典, 民乐',
      model: 'chirp-v3-5',
      status: 'PENDING',
      title: 'Ancient China',
      duration: 0,
    },
    {
      userId: existingUser.id,
      sunoTaskId: 'test-task-005',
      prompt: '激励人心的摇滚音乐，电吉他独奏',
      tags: '摇滚, 激励, 电吉他',
      model: 'chirp-v3-0',
      status: 'FAILED',
      title: 'Rock Revolution',
      duration: 0,
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({ data: taskData });
  }
  console.log(`✅ Created ${tasks.length} tasks`);

  // Show final stats
  console.log('\n📊 Seed Summary:');
  const wallet = await prisma.wallet.findUnique({
    where: { userId: existingUser.id },
  });
  console.log(`   User: ${existingUser.email}`);
  console.log(`   Wallet Balance: ${wallet?.balance} credits`);
  console.log(`   Total Transactions: ${transactions.length}`);
  console.log(`   Total Tasks: ${tasks.length}`);
  console.log(`     - Completed: ${tasks.filter((t) => t.status === 'COMPLETED').length}`);
  console.log(`     - Processing: ${tasks.filter((t) => t.status === 'PROCESSING').length}`);
  console.log(`     - Pending: ${tasks.filter((t) => t.status === 'PENDING').length}`);
  console.log(`     - Failed: ${tasks.filter((t) => t.status === 'FAILED').length}`);
  console.log('\n✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
