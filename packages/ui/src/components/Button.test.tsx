import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Continue Practice</Button>);
    expect(
      screen.getByRole("button", { name: "Continue Practice" }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Continue</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled and non-interactive while loading", async () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    // Real inline `pointer-events: none` now applies (see Button.tsx's
    // comment on the Tailwind compilation defect), so a realistic
    // userEvent.click correctly refuses to interact with it at all —
    // fireEvent dispatches the DOM event directly to confirm the
    // browser's native `disabled` semantics still block the handler.
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Button>Continue Practice</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("respects the disabled prop outside of loading", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("stays a fixed square with the icon size", () => {
    render(<Button size="icon">*</Button>);
    expect(screen.getByRole("button")).toHaveStyle({ paddingLeft: "0px" });
  });
});
