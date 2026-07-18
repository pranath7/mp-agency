import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    if (globalForPrisma.prisma) {
      prismaInstance = globalForPrisma.prisma;
    } else {
      // Resolve direct URL dynamically (handles custom prefixes like STORAGE_URL_NON_POOLING)
      const nonPoolingUrlKey = Object.keys(process.env).find((key) => key.endsWith("_URL_NON_POOLING"));
      const connectionUrl = nonPoolingUrlKey 
        ? process.env[nonPoolingUrlKey] 
        : (process.env.DATABASE_URL || process.env.POSTGRES_URL);

      if (connectionUrl && connectionUrl.startsWith("prisma://")) {
        // Prisma Postgres proxy - does not use local TCP driver adapter
        prismaInstance = new PrismaClient();
      } else {
        // Standard PostgreSQL - requires TCP driver adapter in serverless
        const pool = new pg.Pool({ connectionString: connectionUrl });
        const adapter = new PrismaPg(pool);
        prismaInstance = new PrismaClient({ adapter });
      }

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    }
  }
  return prismaInstance;
}

// Export a Proxy that intercepts all database operations and defers PrismaClient
// instantiation to runtime (first property access). This prevents Next.js compilation/build-time
// evaluation errors caused by WASM/edge target engine checks when the environment is uninitialized.
export const db = new Proxy({} as PrismaClient, {
  get(target, prop) {
    // Bypass React / Next.js / Webpack bundler internal property checks during build-time static analysis
    if (
      typeof prop === "symbol" ||
      prop.toString().startsWith("$$") ||
      prop === "then" ||
      prop === "toJSON" ||
      prop === "constructor"
    ) {
      return undefined;
    }
    
    const client = getPrisma();
    return Reflect.get(client, prop);
  },
});
