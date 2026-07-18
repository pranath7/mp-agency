import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prismaInstance: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    if (globalForPrisma.prisma) {
      prismaInstance = globalForPrisma.prisma;
    } else {
      prismaInstance = new PrismaClient();
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
