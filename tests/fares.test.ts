import { describe, it, expect } from "vitest";
import {
  calculateMetroFare,
  calculatePMPMLFare,
  calculateAutoFare,
  calculateSharedAutoFare,
  calculateCabFare,
  isNightHour,
} from "../lib/fares";

describe("fares.ts - Pune Transit Fare Computations", () => {
  describe("Metro Fare Slabs (Maha Metro)", () => {
    it("charges ₹10 for distances up to 2 km", () => {
      expect(calculateMetroFare(1.2)).toBe(10);
      expect(calculateMetroFare(2.0)).toBe(10);
    });

    it("charges ₹15 for distances 2 to 4 km", () => {
      expect(calculateMetroFare(2.5)).toBe(15);
      expect(calculateMetroFare(4.0)).toBe(15);
    });

    it("charges ₹20 for distances 4 to 8 km", () => {
      expect(calculateMetroFare(6.5)).toBe(20);
    });

    it("charges ₹25 for distances 8 to 12 km", () => {
      expect(calculateMetroFare(10.0)).toBe(25);
    });

    it("charges ₹30 for distances 12 to 16 km", () => {
      expect(calculateMetroFare(14.0)).toBe(30);
    });

    it("charges ₹35 for distances over 16 km", () => {
      expect(calculateMetroFare(22.0)).toBe(35);
    });
  });

  describe("PMPML Bus Fare Slabs", () => {
    it("charges ₹5 for first 2 km", () => {
      expect(calculatePMPMLFare(1.5)).toBe(5);
    });

    it("charges ₹10 for 2 to 4 km", () => {
      expect(calculatePMPMLFare(3.5)).toBe(10);
    });

    it("charges ₹15 for 4 to 8 km", () => {
      expect(calculatePMPMLFare(7.0)).toBe(15);
    });

    it("charges ₹20 for 8 to 12 km", () => {
      expect(calculatePMPMLFare(11.0)).toBe(20);
    });

    it("charges ₹25 for 12 to 16 km", () => {
      expect(calculatePMPMLFare(15.0)).toBe(25);
    });

    it("charges ₹30 for >16 km", () => {
      expect(calculatePMPMLFare(20.0)).toBe(30);
    });
  });

  describe("Auto Rickshaw RTO Tariff Formula", () => {
    it("charges base ₹25 for distance <= 1.5 km", () => {
      const res = calculateAutoFare(1.2, 14); // 2 PM
      expect(res.minFare).toBe(25);
      expect(res.nightSurchargeApplied).toBe(false);
      expect(res.ceilingFare).toBe(30); // 25 * 1.2
    });

    it("computes base + ₹17/km for distance > 1.5 km", () => {
      // 5 km -> 25 + (3.5 * 17) = 25 + 59.5 = 84.5 -> rounded to 85
      const res = calculateAutoFare(5.0, 14);
      expect(res.minFare).toBe(85);
      expect(res.ceilingFare).toBe(102); // 85 * 1.20
      expect(res.breakdown).toContain("RTO Base ₹25");
    });

    it("applies 25% night surcharge between 00:00 and 05:00", () => {
      // 5 km at 2 AM -> 84.5 * 1.25 = 105.625 -> rounded to 106
      const res = calculateAutoFare(5.0, 2);
      expect(res.nightSurchargeApplied).toBe(true);
      expect(res.minFare).toBe(106);
      expect(res.breakdown).toContain("25% night surcharge");
    });

    it("detects night hours correctly", () => {
      expect(isNightHour(0)).toBe(true);
      expect(isNightHour(2)).toBe(true);
      expect(isNightHour(4)).toBe(true);
      expect(isNightHour(5)).toBe(false);
      expect(isNightHour(14)).toBe(false);
    });
  });

  describe("Shared Auto & Cab Fare Estimates", () => {
    it("computes shared auto base and extra km correctly", () => {
      expect(calculateSharedAutoFare(2.0)).toBe(20);
      expect(calculateSharedAutoFare(5.0)).toBe(32); // 20 + 2*6
    });

    it("computes cab fare with distance and time components", () => {
      const res = calculateCabFare(5.0, 15, 14);
      // base 50 + 3*18 (54) + 15*2 (30) = 134
      // min: 134 * 0.95 = 127.3 -> 127
      // max: 134 * 1.15 = 154.1 -> 154
      expect(res.minFare).toBeGreaterThanOrEqual(120);
      expect(res.maxFare).toBeLessThanOrEqual(165);
      expect(res.breakdown).toContain("Base ₹50");
    });
  });
});
