import "server-only";

/** Models sometimes wrap JSON in markdown fences despite instructions not to — strip them before parsing. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const withoutFences = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");
  return JSON.parse(withoutFences);
}
