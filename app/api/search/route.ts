import { NextResponse } from "next/server";
import dataProvider from "@/lib/providers/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({ regions: [], datasets: [], indicators: [] });
    }

    const results = await dataProvider.search(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat mencari data." },
      { status: 500 }
    );
  }
}
