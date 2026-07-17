"use client";

import * as React from "react";
import { ThemeProvider } from "./theme-provider";
import { StorageProvider } from "./storage-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StorageProvider>{children}</StorageProvider>
    </ThemeProvider>
  );
}
