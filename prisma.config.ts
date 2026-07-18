import { defineConfig } from "prisma/config";

// Resolve direct non-pooling URL dynamically (handles custom prefixes like STORAGE_URL_NON_POOLING)
// Using standard postgres:// direct URL bypasses prisma:// protocol complexity for direct client connections
const nonPoolingUrlKey = Object.keys(process.env).find((key) => key.endsWith("_URL_NON_POOLING"));

const directUrl = nonPoolingUrlKey 
  ? process.env[nonPoolingUrlKey] 
  : (process.env.DATABASE_URL || process.env.POSTGRES_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: directUrl,
  },
});
