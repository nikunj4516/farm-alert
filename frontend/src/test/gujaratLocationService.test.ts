import { describe, expect, it } from "vitest";
import {
  getTalukasForDistrict,
  getVillagesForTaluka,
  validateGujaratLocation,
} from "@/services/gujaratLocationService";

describe("Gujarat location hierarchy", () => {
  it("lists Jambughoda under Panchmahal", () => {
    expect(getTalukasForDistrict("Panchmahal")).toContain("Jambughoda");
  });

  it("lists Rampura under Jambughoda", () => {
    expect(getVillagesForTaluka("Panchmahal", "Jambughoda")).toContain("Rampura");
  });

  it("keeps manual Gujarat hierarchy stable", () => {
    expect(
      validateGujaratLocation({
        district: "Panchmahal",
        taluka: "Jambughoda",
        village: "Rampura",
      })
    ).toMatchObject({
      district: "Panchmahal",
      taluka: "Jambughoda",
      village: "Rampura",
      state: "Gujarat",
    });
  });
});

