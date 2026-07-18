import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getPrismaClient() {
  // Find database URL from environment variables dynamically (handles custom prefixes like STORAGE_PRISMA_URL)
  const prismaUrlKey = Object.keys(process.env).find((key) => key.endsWith("_PRISMA_URL"));
  const connectionUrl = prismaUrlKey 
    ? process.env[prismaUrlKey] 
    : (process.env.DATABASE_URL || process.env.POSTGRES_URL);

  return new PrismaClient({
    datasources: {
      db: {
        url: connectionUrl,
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
