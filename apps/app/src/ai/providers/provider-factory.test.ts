import { afterEach, describe, expect, it, vi } from "vitest";
import { createProvider, createProviderFromEnv } from "./provider-factory";

describe("createProvider", () => {
  it("creates each provider with the matching name", () => {
    expect(createProvider("openai").name).toBe("openai");
    expect(createProvider("gemini").name).toBe("gemini");
    expect(createProvider("ollama").name).toBe("ollama");
    expect(createProvider("mock").name).toBe("mock");
  });
});

describe("createProviderFromEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to mock when AI_PROVIDER is unset", () => {
    vi.stubEnv("AI_PROVIDER", "");
    expect(createProviderFromEnv().name).toBe("mock");
  });

  it("defaults to mock for an invalid value, never silently reaching a real provider", () => {
    vi.stubEnv("AI_PROVIDER", "not-a-real-provider");
    expect(createProviderFromEnv().name).toBe("mock");
  });

  it("honors a valid configured provider name", () => {
    vi.stubEnv("AI_PROVIDER", "gemini");
    expect(createProviderFromEnv().name).toBe("gemini");
  });
});
