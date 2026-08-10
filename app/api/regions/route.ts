import { NextResponse } from "next/server";
import dataProvider from "@/lib/providers/server";

export async function GET() {
  try {
    const list = await dataProvider.getRegions();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Regions API error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mengambil data wilayah." },
      { status: 500 }
    );
  }
}
