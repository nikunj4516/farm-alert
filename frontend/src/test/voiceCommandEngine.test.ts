import { describe, expect, it } from "vitest";
import { parseVoiceCommand } from "@/services/voiceCommandEngine";

describe("voice command engine", () => {
  it("routes Gujarati weather commands", () => {
    const command = parseVoiceCommand("હવામાન બતાવો", "gu");

    expect(command.action).toBe("weather");
    expect(command.language).toBe("gu");
  });

  it("routes Hindi news commands", () => {
    const command = parseVoiceCommand("कृषि समाचार खोलो", "hi");

    expect(command.action).toBe("news");
    expect(command.language).toBe("hi");
  });

  it("routes English helpline commands", () => {
    const command = parseVoiceCommand("call farmer helpline", "en");

    expect(command.action).toBe("helpline");
    expect(command.language).toBe("en");
  });

  it("handles romanized farmer commands", () => {
    const command = parseVoiceCommand("mosam batao", "en");

    expect(command.action).toBe("weather");
    expect(command.language).toBe("hi");
  });

  it("falls back safely for unknown commands", () => {
    const command = parseVoiceCommand("play a song", "en");

    expect(command.action).toBe("unknown");
  });
});

