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
