import { describe, it, expect } from "vitest";
import { searchPlaces, reverseGeocode } from "../lib/providers/geocode";

describe("geocode.ts - Search & Reverse Geocode", () => {
  it("searches places matching a query like Pimpri across the map", async () => {
    const results = await searchPlaces("Pimpri");
    expect(results.length).toBeGreaterThan(0);
    const hasPimpri = results.some((r) => (r.title || r.label).toLowerCase().includes("pimpri"));
    expect(hasPimpri).toBe(true);
  });

  it("handles typos gracefully with Damerau-Levenshtein distance (e.g. 'pimpir' -> Pimpri)", async () => {
    const results = await searchPlaces("pimpir");
    expect(results.length).toBeGreaterThan(0);
    const hasPimpri = results.some((r) => (r.title || r.label).toLowerCase().includes("pimpri"));
    expect(hasPimpri).toBe(true);
  });

  it("handles common Pune synonyms like 'hinjawadi' / 'hinjewadi'", async () => {
    const results = await searchPlaces("hinjawadi");
    expect(results.length).toBeGreaterThan(0);
    const hasHinjewadi = results.some((r) => (r.title || r.label).toLowerCase().includes("hinj"));
    expect(hasHinjewadi).toBe(true);
  });

  it("resolves abbreviations like 'bhs' and 'pnq' / 'airport'", async () => {
    const airportResults = await searchPlaces("airport");
    expect(airportResults.length).toBeGreaterThan(0);
    expect(airportResults[0].title.toLowerCase()).toContain("airport");

    const bhsResults = await searchPlaces("bhs");
    expect(bhsResults.length).toBeGreaterThan(0);
    expect(bhsResults[0].title.toLowerCase()).toContain("balewadi");
  });

  it("searches local landmarks matching Kharadi", async () => {
    const results = await searchPlaces("Kharadi");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].label).toContain("Kharadi");
  });

  it("reverse geocodes coordinates to a real location name", async () => {
    const label = await reverseGeocode(18.5525, 73.9190);
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(3);
  });
});
