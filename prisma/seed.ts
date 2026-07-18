import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prismaUrlKey = Object.keys(process.env).find((key) => key.endsWith("_PRISMA_URL"));
const connectionUrl = prismaUrlKey 
  ? process.env[prismaUrlKey] 
  : (process.env.DATABASE_URL || process.env.POSTGRES_URL);

const db = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function main() {
  console.log("🌱 Seeding database users...");

  const ownerPwd = await bcrypt.hash("owner123!", 12);
  const partnerPwd = await bcrypt.hash("partner123!", 12);

  // Seed default team users
  const owner = await db.user.upsert({
    where: { email: "owner@mpdigital.in" },
    update: {},
    create: {
      name: "MP Owner",
      email: "owner@mpdigital.in",
      password: ownerPwd,
      role: "owner",
    },
  });

  const partner = await db.user.upsert({
    where: { email: "partner@mpdigital.in" },
    update: {},
    create: {
      name: "MP Partner",
      email: "partner@mpdigital.in",
      password: partnerPwd,
      role: "partner",
    },
  });

  console.log("✅ Users seeded:", owner.email, partner.email);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Team accounts initialized successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
