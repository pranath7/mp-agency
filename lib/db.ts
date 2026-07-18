import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Resolve connection URL dynamically using the direct non-pooling postgres:// URL
// Bypasses the prisma:// Accelerate protocol for standard TCP database connections
function getPrismaClient() {
  const nonPoolingUrlKey = Object.keys(process.env).find((key) => key.endsWith("_URL_NON_POOLING"));
  const connectionUrl = nonPoolingUrlKey 
    ? process.env[nonPoolingUrlKey] 
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
