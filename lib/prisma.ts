import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};



const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  // Use the pg adapter for Edge environments.
  // If we are in a build environment or missing the URL, fallback to standard client
  // to prevent build-time crashes (especially with pg adapter 'bind' errors).
  if (connectionString) {
    try {
      const pool = new Pool({ connectionString });
      const adapter = new PrismaPg(pool) as any;
      return new PrismaClient({ adapter });
    } catch (e) {
      console.warn('Failed to initialize Prisma adapter:', e);
      // Fallback
    }
  }

  return new PrismaClient();
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
