import { NextResponse } from "next/server";
import dataProvider from "@/lib/providers/server";
import { importDatasetSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const list = await dataProvider.getDatasets(category);
    return NextResponse.json(list);
  } catch (error) {
    console.error("Datasets GET API error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengambil daftar dataset." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Authorization check for dataset import (OWASP A01)
    const authHeader = request.headers.get("Authorization");
    const configuredApiKey = process.env.ADMIN_API_KEY || "nusadata-admin-secret-key";

    if (!authHeader || authHeader !== `Bearer ${configuredApiKey}`) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid or missing ADMIN_API_KEY token." },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate payload against Zod schema
    const parsed = importDatasetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { 
          message: "Validasi payload gagal.", 
          errors: parsed.error.flatten().fieldErrors 
        },
        { status: 400 }
      );
    }

    const { metadata, dataPoints } = parsed.data;

    // Call data provider to save
    const result = await dataProvider.importDataset(metadata, dataPoints);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Datasets POST API error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengimpor data." },
      { status: 500 }
    );
  }
}
