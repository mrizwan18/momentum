"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, X } from "lucide-react";
import { cn } from "../lib/cn";
import { VisuallyHidden } from "./VisuallyHidden";
import { useToast } from "../hooks/use-toast";

export const ToastProvider = ToastPrimitive.Provider;

export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4",
      "sm:right-0 sm:bottom-0 sm:max-w-sm",
      className,
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

/**
 * CSS transitions (not Framer Motion) keyed off data-state, so exit timing
 * is Radix-native and reduced motion is already handled by the global
 * `prefers-reduced-motion` rule in globals.css.
 */
const toastVariants = cva(
  cn(
    "pointer-events-auto relative flex w-full items-start gap-3 rounded-xl border bg-surface p-4 text-foreground shadow-lg",
    "transition-all duration-standard ease-momentum",
    "data-[state=closed]:translate-x-2 data-[state=closed]:opacity-0",
  ),
  {
    variants: {
      variant: {
        default: "border-border",
        success: "border-success",
        danger: "border-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type ToastProps = React.ComponentPropsWithoutRef<
  typeof ToastPrimitive.Root
> &
  VariantProps<typeof toastVariants>;

export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant, ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    className={cn(toastVariants({ variant }), className)}
    {...props}
  />
));
Toast.displayName = "Toast";

export const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm text-foreground-muted", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center rounded-md border border-border bg-transparent px-3 text-sm font-medium",
      "transition-colors hover:bg-surface-raised",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      "disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute top-2 right-2 inline-flex h-6 w-6 items-center justify-center rounded-md text-foreground-muted",
      "transition-colors hover:bg-surface-raised hover:text-foreground",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
      className,
    )}
    {...props}
  >
    <X aria-hidden="true" className="h-4 w-4" />
    <VisuallyHidden>Dismiss</VisuallyHidden>
  </ToastPrimitive.Close>
));
ToastClose.displayName = "ToastClose";

/** Mount once near the root of the app. Trigger toasts via toast() from anywhere. */
export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <ToastProvider>
      {toasts.map(
        ({
          id,
          title,
          description,
          variant,
          actionLabel,
          onAction,
          loading,
          duration,
        }) => (
          <Toast
            key={id}
            variant={variant}
            duration={duration}
            aria-busy={loading || undefined}
            onOpenChange={(open) => {
              if (!open) dismiss(id);
            }}
          >
            <div className="flex flex-1 items-start gap-2">
              {loading ? (
                <Loader2
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-foreground-muted"
                />
              ) : null}
              <div className="flex-1 space-y-1">
                <ToastTitle>{title}</ToastTitle>
                {description ? (
                  <ToastDescription>{description}</ToastDescription>
                ) : null}
              </div>
            </div>
            {actionLabel && onAction ? (
              <ToastAction
                altText={actionLabel}
                disabled={loading}
                onClick={onAction}
              >
                {actionLabel}
              </ToastAction>
            ) : null}
            <ToastClose />
          </Toast>
        ),
      )}
      <ToastViewport />
    </ToastProvider>
  );
}
