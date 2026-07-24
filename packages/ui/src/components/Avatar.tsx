import * as React from "react";
import { User } from "lucide-react";
import { cn } from "../lib/cn";
import { tintColor } from "../lib/shape";
import type { Tint } from "../lib/tint";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rendered as initials when no photo exists — Momentum has no photo upload. */
  name?: string | null;
  tint?: Tint;
}

function initialsFor(name: string | null | undefined): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

/**
 * docs/design/PIXEL_SPEC.md B1/B4 avatar: 44x44 circle, `radius.circle`.
 * PIXEL_SPEC's reference art shows a photo, but Momentum has no photo
 * upload feature — initials-on-tint is the honest fallback once a display
 * name exists; a generic person icon (not fabricated initials) fills the
 * circle before that, so it never renders empty.
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, tint = "blue", className, style, ...props }, ref) => {
    const initials = initialsFor(name);
    return (
      <div
        ref={ref}
        role="img"
        aria-label={name ? `${name}'s avatar` : "No profile name set"}
        style={{
          height: "44px",
          width: "44px",
          backgroundColor: tintColor[tint],
          ...style,
        }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          "text-sm font-semibold text-foreground",
          className,
        )}
        {...props}
      >
        {initials || <User aria-hidden="true" className="h-5 w-5" />}
      </div>
    );
  },
);
Avatar.displayName = "Avatar";
