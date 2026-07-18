import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// In Prisma 7, connection URLs are resolved dynamically from prisma.config.ts at runtime,
// and the PrismaClient constructor does not accept 'datasources' as option anymore.
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
