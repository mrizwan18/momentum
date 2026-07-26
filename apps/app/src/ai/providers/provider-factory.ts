import "server-only";

import type { AiProviderName } from "@momentum/types";
import type { AiProvider } from "../types";
import { createGeminiProvider } from "./gemini-provider";
import { createMockProvider } from "./mock-provider";
import { createOllamaProvider } from "./ollama-provider";
import { createOpenAiProvider } from "./openai-provider";

/**
 * Dependency injection point: which provider backs the Gateway is a config
 * change (`AI_PROVIDER` env var), never a code change in any feature.
 * Defaults to "mock" — a missing/invalid value never silently reaches a
 * real provider without a key configured.
 */
export function createProvider(name: AiProviderName): AiProvider {
  switch (name) {
    case "openai":
      return createOpenAiProvider();
    case "gemini":
      return createGeminiProvider();
    case "ollama":
      return createOllamaProvider();
    case "mock":
      return createMockProvider();
  }
}

const VALID_PROVIDER_NAMES: AiProviderName[] = [
  "openai",
  "gemini",
  "ollama",
  "mock",
];

function isValidProviderName(value: string): value is AiProviderName {
  return (VALID_PROVIDER_NAMES as string[]).includes(value);
}

export function createProviderFromEnv(): AiProvider {
  const configured = process.env.AI_PROVIDER;
  const name =
    configured && isValidProviderName(configured) ? configured : "mock";
  return createProvider(name);
}
