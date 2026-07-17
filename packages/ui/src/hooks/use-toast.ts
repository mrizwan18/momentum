"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "danger";

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  actionLabel?: string;
  onAction?: () => void;
  /** Shows a spinner and disables the action while an async task runs. */
  loading?: boolean;
  duration?: number;
}

type ToastInput = Omit<ToastData, "id">;

const MAX_TOASTS = 3;

let listeners: Array<(toasts: ToastData[]) => void> = [];
let memoryState: ToastData[] = [];
let idCounter = 0;

function emit() {
  listeners.forEach((listener) => listener(memoryState));
}

export function toast(input: ToastInput): { id: string; dismiss: () => void } {
  idCounter += 1;
  const id = `toast-${idCounter}`;
  const next: ToastData = { duration: 5000, variant: "default", ...input, id };
  memoryState = [next, ...memoryState].slice(0, MAX_TOASTS);
  emit();

  return { id, dismiss: () => dismissToast(id) };
}

export function dismissToast(id: string) {
  memoryState = memoryState.filter((entry) => entry.id !== id);
  emit();
}

export function dismissAll() {
  memoryState = [];
  emit();
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastData[]>(memoryState);

  React.useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((listener) => listener !== setToasts);
    };
  }, []);

  return { toasts, dismiss: dismissToast };
}
