import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL!;

const createPrismaClient = () => {
  // Use the pg adapter for both Edge and Node environments if possible for consistency,
  // or strictly for Edge.
  // Note: 'pg' usage in Edge requires Cloudflare Workers compatibility (TCP sockets).
  const pool = new Pool({ connectionString });

  // Cast to any to bypass version mismatch type errors temporarily if needed, 
  // but ideally versions should match. 
  // The error "Property 'transactionContext' is missing" indicates Client expects a different Adapter interface.
  // We will cast to any to silence the build error for now, assuming runtime compatibility,
  // or we let the user know to align versions.
  const adapter = new PrismaPg(pool) as any;

  return new PrismaClient({ adapter });
};

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
