"use client";

import * as React from "react";
import { createMomentumStorage, type MomentumStorage } from "@momentum/storage";

const StorageContext = React.createContext<MomentumStorage | null>(null);

/**
 * The only place a MomentumStorage instance is constructed. UI code reaches
 * Dexie exclusively through useStorage() (PROJECT_RULES.md #4 Storage).
 */
export interface StorageProviderProps {
  children: React.ReactNode;
  /** Injects a pre-built storage instance — for tests that need to seed data before render. */
  value?: MomentumStorage;
}

export function StorageProvider({ children, value }: StorageProviderProps) {
  const [created] = React.useState<MomentumStorage | null>(() =>
    typeof window === "undefined" ? null : createMomentumStorage(),
  );
  const storage = value ?? created;

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): MomentumStorage {
  const storage = React.useContext(StorageContext);
  if (!storage) {
    throw new Error(
      "useStorage must be used within <StorageProvider>, on the client",
    );
  }
  return storage;
}
