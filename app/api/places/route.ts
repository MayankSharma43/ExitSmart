import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/providers/geocode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";

  try {
    const places = await searchPlaces(q);
    return NextResponse.json({ places });
  } catch (err: any) {
    console.error("Geocoding lookup error:", err);
    return NextResponse.json({ places: [] }, { status: 500 });
  }
}
