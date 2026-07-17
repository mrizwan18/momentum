import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/cn";

/**
 * docs/design/design-language.md Typography Rules: headlines motivate, body
 * explains, captions reassure, numbers deserve emphasis.
 */
const headingVariants = cva("text-balance font-semibold text-foreground", {
  variants: {
    size: {
      xl: "text-3xl leading-tight",
      lg: "text-2xl leading-tight",
      md: "text-xl leading-snug",
      sm: "text-lg leading-snug",
    },
  },
  defaultVariants: { size: "lg" },
});

type HeadingElement = "h1" | "h2" | "h3" | "h4";

export interface HeadingProps
  extends
    React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingElement;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = "h2", size, className, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref}
        className={cn(headingVariants({ size }), className)}
        {...props}
      />
    );
  },
);
Heading.displayName = "Heading";

const textVariants = cva("", {
  variants: {
    tone: {
      default: "text-foreground",
      muted: "text-foreground-muted",
    },
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: { tone: "default", size: "md" },
});

type TextElement = "p" | "span" | "div";

export interface TextProps
  extends
    React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  as?: TextElement;
}

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ as = "p", tone, size, className, ...props }, ref) => {
    const Comp = as;
    return (
      <Comp
        ref={ref as React.Ref<HTMLParagraphElement>}
        className={cn(textVariants({ tone, size }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export const Caption = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
));
Caption.displayName = "Caption";

const numberVariants = cva("font-semibold tabular-nums text-foreground", {
  variants: {
    size: {
      lg: "text-4xl",
      md: "text-2xl",
      sm: "text-lg",
    },
  },
  defaultVariants: { size: "md" },
});

export interface NumberDisplayProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof numberVariants> {}

export const NumberDisplay = React.forwardRef<
  HTMLSpanElement,
  NumberDisplayProps
>(({ size, className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(numberVariants({ size }), className)}
    {...props}
  />
));
NumberDisplay.displayName = "NumberDisplay";
