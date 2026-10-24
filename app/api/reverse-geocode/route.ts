import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/providers/geocode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Missing lat or lng" }, { status: 400 });
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: "Invalid lat or lng" }, { status: 400 });
  }

  try {
    const label = await reverseGeocode(lat, lng);
    return NextResponse.json({ label });
  } catch (err: any) {
    console.error("Reverse geocoding error:", err);
    return NextResponse.json({ label: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` });
  }
}
