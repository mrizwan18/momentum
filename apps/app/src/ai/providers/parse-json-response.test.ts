import { describe, expect, it } from "vitest";
import { extractJson } from "./parse-json-response";

describe("extractJson", () => {
  it("parses plain JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips a ```json fenced block", () => {
    expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("strips a plain ``` fenced block", () => {
    expect(extractJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("trims surrounding whitespace", () => {
    expect(extractJson('  \n{"a":1}\n  ')).toEqual({ a: 1 });
  });

  it("throws on genuinely invalid JSON", () => {
    expect(() => extractJson("not json")).toThrow();
  });
});
