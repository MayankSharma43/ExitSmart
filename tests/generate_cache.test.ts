import { describe, it, expect } from "vitest";
import { getRecommendations } from "../lib/recommend";
import fs from "fs";
import path from "path";

describe("Precompute reference routes for offline cache", () => {
  it("precomputes and saves all 4 reference routes to data/cache/reference_routes.json", async () => {
    const referenceJourneys = [
      {
        id: "ref_1_ramwadi_kharadi",
        name: "Ramwadi Metro to Kharadi (EON IT Park)",
        origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
        destination: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
      },
      {
        id: "ref_2_ramwadi_viman_nagar",
        name: "Ramwadi Metro to Viman Nagar",
        origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
        destination: { lat: 18.5645, lng: 73.9145, label: "Viman Nagar (Datta Mandir)" },
      },
      {
        id: "ref_3_ramwadi_baner",
        name: "Ramwadi Metro to Baner",
        origin: { lat: 18.5524, lng: 73.9189, label: "Ramwadi Metro Station" },
        destination: { lat: 18.5640, lng: 73.7740, label: "Baner (Balewadi Phata)" },
      },
      {
        id: "ref_4_kothrud_kharadi",
        name: "Kothrud (Chandani Chowk) to Kharadi",
        origin: { lat: 18.5075, lng: 73.7845, label: "Kothrud (Chandani Chowk)" },
        destination: { lat: 18.5516, lng: 73.9515, label: "EON IT Park, Kharadi" },
      },
    ];

    const cacheData: Record<string, any> = {};

    for (const journey of referenceJourneys) {
      const balanced = await getRecommendations({
        origin: journey.origin,
        destination: journey.destination,
        mode: "balanced",
      });
      const rain = await getRecommendations({
        origin: journey.origin,
        destination: journey.destination,
        mode: "rain",
      });

      cacheData[journey.id] = {
        name: journey.name,
        origin: journey.origin,
        destination: journey.destination,
        balanced,
        rain,
      };
    }

    const cacheFilePath = path.join(process.cwd(), "data", "cache", "reference_routes.json");
    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2), "utf-8");
    expect(fs.existsSync(cacheFilePath)).toBe(true);
  });
});
