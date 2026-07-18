import { defineConfig } from "prisma/config";

// Resolve pooled and direct URLs dynamically supporting custom prefixes (e.g. STORAGE_PRISMA_URL, STORAGE_URL_NON_POOLING)
const prismaUrlKey = Object.keys(process.env).find((key) => key.endsWith("_PRISMA_URL"));
const nonPoolingUrlKey = Object.keys(process.env).find((key) => key.endsWith("_URL_NON_POOLING"));

const pooledUrl = prismaUrlKey 
  ? process.env[prismaUrlKey] 
  : (process.env.DATABASE_URL || process.env.POSTGRES_URL);

const directUrl = nonPoolingUrlKey 
  ? process.env[nonPoolingUrlKey] 
  : (process.env.DIRECT_URL || pooledUrl);

export default defineConfig({
  earlyAccess: true,
  schema: "prisma/schema.prisma",
  datasource: {
    url: pooledUrl,
    directUrl: directUrl,
  },
});
