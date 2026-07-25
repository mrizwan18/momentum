import { describe, expect, it } from "vitest";
import {
  NOTIFICATION_TEMPLATES,
  pickTemplate,
  renderTemplate,
  templatesForContext,
} from "./copy-bank";

describe("templatesForContext", () => {
  it("only returns templates matching the given context", () => {
    const templates = templatesForContext("streak-at-risk");
    expect(templates.length).toBeGreaterThan(0);
    expect(templates.every((t) => t.context === "streak-at-risk")).toBe(true);
  });

  it("covers every context with at least one template", () => {
    const contexts = new Set(NOTIFICATION_TEMPLATES.map((t) => t.context));
    expect(contexts).toEqual(
      new Set([
        "streak-at-risk",
        "havent-practiced-today",
        "comeback",
        "generic",
      ]),
    );
  });
});

describe("pickTemplate", () => {
  it("avoids a recently-used template when a fresher one exists", () => {
    const candidates = templatesForContext("streak-at-risk");
    const recent = candidates.slice(0, candidates.length - 1).map((t) => t.key);

    const picked = pickTemplate("streak-at-risk", recent, () => 0);
    expect(picked.key).toBe(candidates[candidates.length - 1].key);
  });

  it("falls back to the full pool once every template has recently been used", () => {
    const candidates = templatesForContext("comeback");
    const recent = candidates.map((t) => t.key);

    const picked = pickTemplate("comeback", recent, () => 0);
    expect(picked.key).toBe(candidates[0].key);
  });

  it("uses the injected random source deterministically", () => {
    const candidates = templatesForContext("generic");
    const picked = pickTemplate("generic", [], () => 0.999);
    expect(picked.key).toBe(candidates[candidates.length - 1].key);
  });
});

describe("renderTemplate", () => {
  it("substitutes {streak} in the body", () => {
    const template = templatesForContext("streak-at-risk")[0];
    const rendered = renderTemplate(template, { streak: 12 });
    expect(rendered.body).not.toContain("{streak}");
    expect(rendered.body).toContain("12");
    expect(rendered.title).toBe(template.title);
  });
});
