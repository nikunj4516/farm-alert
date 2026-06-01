import { describe, expect, it } from "vitest";
import {
  GUJARAT_DISTRICTS,
  getTalukasForDistrict,
  getVillagesForTaluka,
  validateGujaratLocation,
  getLocationLabel,
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

  it("localizes saved canonical village names", () => {
    expect(getLocationLabel("Rampura", "gu")).toBe("રામપુરા");
    expect(getLocationLabel("Jambughoda", "hi")).toBe("जांबुघोड़ा");
  });

  it("localizes Vadodara hierarchy values used in profile setup", () => {
    expect(getLocationLabel("Vadodara", "gu")).toBe("વડોદરા");
    expect(getLocationLabel("Vadodara", "hi")).toBe("वडोदरा");
    expect(getLocationLabel("Desar", "gu")).toBe("ડેસર");
    expect(getLocationLabel("Desar", "hi")).toBe("डेसर");
    expect(getLocationLabel("Dabhoi", "gu")).toBe("ડભોઇ");
    expect(getLocationLabel("Dabhoi", "hi")).toBe("डभोई");
    expect(getLocationLabel("Savli", "hi")).toBe("सावली");
  });

  it("localizes Mahisagar taluka names without English fallback", () => {
    expect(getLocationLabel("Balasinor", "gu")).toBe("બાલાસિનોર");
    expect(getLocationLabel("Kadana", "gu")).toBe("કડાણા");
    expect(getLocationLabel("Khanpur", "gu")).toBe("ખાનપુર");
    expect(getLocationLabel("Lunawada", "gu")).toBe("લુણાવાડા");
    expect(getLocationLabel("Santrampur", "gu")).toBe("સંતરામપુર");
    expect(getLocationLabel("Balasinor", "hi")).toBe("बालासिनोर");
  });

  it("does not leak Latin taluka names in Gujarati or Hindi dropdown labels", () => {
    const allTalukas = GUJARAT_DISTRICTS.flatMap((district) => district.talukas);
    for (const taluka of allTalukas) {
      expect(getLocationLabel(taluka, "gu")).not.toMatch(/[A-Za-z]/);
      expect(getLocationLabel(taluka, "hi")).not.toMatch(/[A-Za-z]/);
    }
  });
});
