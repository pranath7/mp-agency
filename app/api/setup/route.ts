import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      seededUsers: [owner.email, partner.email],
    });
  } catch (error: any) {
    console.error("Setup Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to seed database",
        details: error,
      },
      { status: 500 }
    );
  }
}
