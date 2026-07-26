import "server-only";

import { getAiResponseCache } from "../cache/response-cache";
import { createProviderFromEnv } from "../providers/provider-factory";
import { createAiGateway, type AiGateway } from "./ai-gateway";

let singleton: AiGateway | null = null;

/** Server-only composition root — reads AI_PROVIDER + provider keys from env, wires the DI'd Gateway. Only ever imported from API route handlers, never from client code. */
export function getDefaultAiGateway(): AiGateway {
  singleton ??= createAiGateway({
    provider: createProviderFromEnv(),
    cache: getAiResponseCache(),
  });
  return singleton;
}
