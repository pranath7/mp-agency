import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

async function main() {
  const adapter = new PrismaLibSql({ url: "file:prisma/dev.db" });
  const db = new PrismaClient({ adapter } as any);

  const user = await db.user.findUnique({ where: { email: "owner@mpdigital.in" } });
  if (!user) {
    console.log("User not found!");
    return;
  }

  console.log("User found:", user.email);
  const isValid = await bcrypt.compare("owner123!", user.password);
  console.log("Password isValid:", isValid);
  
  await db.$disconnect();
}

main().catch(console.error);
