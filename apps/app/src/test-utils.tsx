import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { AppProviders } from "./providers";

/**
 * Wraps `ui` with the same Theme + Storage providers the real app mounts,
 * so feature tests don't have to hand-assemble the provider tree.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AppProviders, ...options });
}

export * from "@testing-library/react";
