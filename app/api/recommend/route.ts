import { NextRequest, NextResponse } from "next/server";
import { getRecommendations } from "@/lib/recommend";
import { RecommendRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecommendRequest;

    if (!body || !body.origin || !body.destination) {
      return NextResponse.json(
        { error: "Origin and Destination are required." },
        { status: 400 }
      );
    }

    // Edge case: Origin equals Destination
    if (
      Math.abs(body.origin.lat - body.destination.lat) < 0.0001 &&
      Math.abs(body.origin.lng - body.destination.lng) < 0.0001
    ) {
      return NextResponse.json(
        { error: "Start point and destination are the same." },
        { status: 400 }
      );
    }

    const recommendations = await getRecommendations(body);
    return NextResponse.json(recommendations);
  } catch (err: any) {
    console.error("Error generating recommendations:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations. Please try again." },
      { status: 500 }
    );
  }
}
