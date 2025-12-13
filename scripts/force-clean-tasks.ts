
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🧹 Force cleaning stuck tasks...')

    // 1. Reset all PROCESSING/PENDING to FAILED
    const updated = await prisma.task.updateMany({
        where: {
            status: { in: ['PENDING', 'PROCESSING'] }
        },
        data: {
            status: 'FAILED',
            failReason: 'Force cleaned by system script'
        }
    })

    console.log(`✅ Reset ${updated.count} stuck tasks to FAILED.`)

    // 2. Delete test tasks if any (Optional, be careful)
    // const deleted = await prisma.task.deleteMany({
    //   where: {
    //     title: { contains: 'Test' }
    //   }
    // })
    // console.log(`🗑️ Deleted ${deleted.count} test tasks.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
