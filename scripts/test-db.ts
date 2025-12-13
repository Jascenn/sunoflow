
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Testing DB connection...')
    const start = Date.now()
    const count = await prisma.task.count()
    console.log(`Task count: ${count}, Time: ${Date.now() - start}ms`)

    // Try to create a dummy task to test write lock
    const user = await prisma.user.findFirst()
    if (user) {
        console.log('Testing write...')
        try {
            await prisma.task.create({
                data: {
                    userId: user.id,
                    prompt: 'db_test_write',
                    model: 'V3_5',
                    status: 'FAILED',
                    metadata: { test: true }
                }
            })
            console.log('Write success')
        } catch (e) {
            console.error('Write failed:', e)
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
