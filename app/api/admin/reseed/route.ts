import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    // 1. Authorization check (OWASP A01: Broken Access Control)
    const authHeader = request.headers.get("Authorization");
    const configuredApiKey = process.env.ADMIN_API_KEY || "nusadata-admin-secret-key";

    if (!authHeader || authHeader !== `Bearer ${configuredApiKey}`) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid or missing ADMIN_API_KEY token." },
        { status: 401 }
      );
    }

    // 2. Perform the update
    // Update all dataset status in PostgreSQL to "Official"
    const updateResult = await prisma.dataset.updateMany({
      data: {
        status: "Official",
      },
    });

    return NextResponse.json({
      message: "Database status successfully updated to Official!",
      updatedCount: updateResult.count,
    });
  } catch (error: any) {
    console.error("Reseed API error:", error);
    
    // Check if database is offline or not configured
    if (error.code === "ECONNREFUSED" || error.message?.includes("connect")) {
      return NextResponse.json(
        { message: "Gagal menghubungkan ke PostgreSQL. Pastikan database Anda aktif." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memperbarui status database." },
      { status: 500 }
    );
  }
}
