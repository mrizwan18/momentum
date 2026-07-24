/**
 * docs/design/PIXEL_SPEC.md A3 surface tints — shared by every card that
 * needs to signal semantic category through background color (Hero,
 * Analytics, Recommendation). The actual color values live in ./shape.ts
 * as inline styles (Tailwind doesn't reliably compile `bg-tint-*`
 * utilities in this project — see the comment there).
 */
export type Tint = "blue" | "peach" | "pink" | "green" | "purple";
