import { NextResponse } from "next/server";
import dataProvider from "@/lib/providers/server";

export async function POST(request: Request) {
  let methodName = "unknown";
  try {
    const { method, args } = await request.json();
    methodName = method;
    
    // Whitelist allowed data access methods
    const allowedMethods = [
      "getRegions",
      "getDatasets",
      "getDatasetDetails",
      "getNationalOverview",
      "getRecentActivities",
      "getRanking",
      "getComparison",
      "getDataPoints",
      "importDataset",
    ];

    if (!allowedMethods.includes(method)) {
      return NextResponse.json({ message: "Method not allowed" }, { status: 400 });
    }

    const fn = (dataProvider as any)[method];
    if (typeof fn !== "function") {
      return NextResponse.json({ message: "Method not implemented" }, { status: 404 });
    }

    const result = await fn.apply(dataProvider, args);
    return NextResponse.json(result);
  } catch (error) {
    console.error(`RPC API error on method '${methodName}':`, error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal saat memproses data query." },
      { status: 500 }
    );
  }
}
