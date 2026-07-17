import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  createMomentumDatabase,
  createMomentumStorage,
} from "@momentum/storage";
import { StorageProvider, useStorage } from "./storage-provider";

function Probe() {
  const storage = useStorage();
  return <div data-testid="probe">{storage.db.name}</div>;
}

function Bare() {
  useStorage();
  return null;
}

describe("StorageProvider", () => {
  it("provides a MomentumStorage instance to descendants", () => {
    render(
      <StorageProvider>
        <Probe />
      </StorageProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent("momentum");
  });

  it("throws when useStorage is used outside the provider", () => {
    expect(() => render(<Bare />)).toThrow(/StorageProvider/);
  });

  it("uses an injected storage instance when provided", () => {
    const injected = createMomentumStorage(
      createMomentumDatabase(`test-injected-${Math.random()}`),
    );
    render(
      <StorageProvider value={injected}>
        <Probe />
      </StorageProvider>,
    );
    expect(screen.getByTestId("probe")).toHaveTextContent(injected.db.name);
  });
});
