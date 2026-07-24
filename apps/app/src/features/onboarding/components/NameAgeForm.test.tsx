import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import {
  createMomentumDatabase,
  createMomentumStorage,
  type MomentumStorage,
} from "@momentum/storage";
import { StorageProvider } from "@/providers/storage-provider";
import { NameAgeForm } from "./NameAgeForm";

let storage: MomentumStorage;

function renderForm(onNext = vi.fn()) {
  return render(
    <StorageProvider value={storage}>
      <NameAgeForm onBack={vi.fn()} onNext={onNext} />
    </StorageProvider>,
  );
}

describe("NameAgeForm", () => {
  beforeEach(() => {
    storage = createMomentumStorage(
      createMomentumDatabase(`test-name-age-form-${Math.random()}`),
    );
  });

  afterEach(async () => {
    await storage.db.delete();
  });

  it("shows the headline, fields, and safety caption", () => {
    renderForm();
    expect(screen.getByText("Almost there! 👋")).toBeInTheDocument();
    expect(screen.getByLabelText("Your Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Your Age")).toBeInTheDocument();
    expect(
      screen.getByText(/your data is safe and secure/i),
    ).toBeInTheDocument();
  });

  it("calls onBack when the back button is pressed", async () => {
    const onBack = vi.fn();
    render(
      <StorageProvider value={storage}>
        <NameAgeForm onBack={onBack} onNext={vi.fn()} />
      </StorageProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("blocks submission and shows an error when the fields are empty", async () => {
    const onNext = vi.fn();
    renderForm(onNext);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).not.toHaveBeenCalled();
    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
  });

  it("persists the name and age through the repository pattern, then calls onNext", async () => {
    const onNext = vi.fn();
    renderForm(onNext);
    await userEvent.type(screen.getByLabelText("Your Name"), "Riyaaz");
    await userEvent.type(screen.getByLabelText("Your Age"), "24");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => expect(onNext).toHaveBeenCalledOnce());
    const user = await storage.users.get();
    expect(user?.displayName).toBe("Riyaaz");
    expect(user?.age).toBe(24);
  });

  it("has no accessibility violations", async () => {
    const { container } = renderForm();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
