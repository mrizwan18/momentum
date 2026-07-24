import * as React from "react";
import { cn } from "../lib/cn";

/**
 * docs/design/design-language.md Typography Rules: headlines motivate, body
 * explains, captions reassure, numbers deserve emphasis. Sizes match
 * docs/design/PIXEL_SPEC.md A4 (hero ~24px is this app's biggest heading —
 * PIXEL_SPEC's own screens never push a text heading past "screen title,"
 * the size scale stays compressed relative to earlier drafts).
 *
 * Font-size/line-height are applied via inline style rather than Tailwind
 * `text-*`/`leading-*`/`text-balance` utilities — direct inspection of the
 * compiled production stylesheet shows most of those classes (along with
 * many other long-standing utilities like `min-h-touch`) silently fail to
 * compile in this project. `font-semibold`/`font-medium`/`text-foreground*`
 * were confirmed present and stay as classes.
 */
export type HeadingSize = "hero" | "xl" | "lg" | "md" | "sm";

const headingSizeStyle: Record<HeadingSize, React.CSSProperties> = {
  /** Reserved for the one hero moment per screen (greeting, completion). */
  hero: { fontSize: "1.5rem", lineHeight: 1.2 },
  /** PIXEL_SPEC "Screen title" (18-20px). */
  xl: { fontSize: "1.25rem", lineHeight: 1.2 },
  /** PIXEL_SPEC "Section heading" (17-18px). */
  lg: { fontSize: "1.125rem", lineHeight: 1.2 },
  /** PIXEL_SPEC "Card title" (15-16px). */
  md: { fontSize: "1rem", lineHeight: 1.375 },
  sm: { fontSize: "0.875rem", lineHeight: 1.375 },
};

type HeadingElement = "h1" | "h2" | "h3" | "h4";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingElement;
  size?: HeadingSize;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = "h2", size = "lg", className, style, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        style={{ ...headingSizeStyle[size], ...style }}
        className={cn("font-semibold text-foreground", className)}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

export type TextSize = "sm" | "md" | "lg";
export type TextTone = "default" | "muted";

const textSizeStyle: Record<TextSize, React.CSSProperties> = {
  sm: { fontSize: "0.875rem" },
  md: { fontSize: "1rem" },
  lg: { fontSize: "1.125rem" },
};

const textToneClassName: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-foreground-muted",
};

type TextElement = "p" | "span" | "div";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: TextElement;
  tone?: TextTone;
  size?: TextSize;
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  (
    { as = "p", tone = "default", size = "md", className, style, ...props },
    ref,
  ) => {
    const Comp = as;
    return (
      <Comp
        ref={ref as React.Ref<HTMLParagraphElement>}
        style={{ ...textSizeStyle[size], ...style }}
        className={cn(textToneClassName[tone], className)}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export const Caption = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, style, ...props }, ref) => (
  <p
    ref={ref}
    style={{ fontSize: "0.75rem", ...style }}
    className={cn("text-foreground-muted", className)}
    {...props}
  />
));
Caption.displayName = "Caption";

export type NumberDisplaySize = "hero" | "lg" | "md" | "sm";

/** Sizes match docs/design/PIXEL_SPEC.md A4's "Hero number" (36-40px) down to small inline numerals. */
const numberSizeStyle: Record<NumberDisplaySize, React.CSSProperties> = {
  /** Reserved for the one hero number per screen (e.g. the streak count). */
  hero: { fontSize: "2.25rem" },
  lg: { fontSize: "1.5rem" },
  md: { fontSize: "1.25rem" },
  sm: { fontSize: "1rem" },
};

export interface NumberDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: NumberDisplaySize;
}

export const NumberDisplay = React.forwardRef<
  HTMLSpanElement,
  NumberDisplayProps
>(({ size = "md", className, style, ...props }, ref) => (
  <span
    ref={ref}
    style={{ ...numberSizeStyle[size], ...style }}
    className={cn("font-semibold text-foreground tabular-nums", className)}
    {...props}
  />
));
NumberDisplay.displayName = "NumberDisplay";
