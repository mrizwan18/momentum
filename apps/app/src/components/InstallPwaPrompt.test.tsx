import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InstallPwaPrompt } from "./InstallPwaPrompt";
import { usePwaInstall } from "@/hooks/use-pwa-install";

vi.mock("@/hooks/use-pwa-install", () => ({
  usePwaInstall: vi.fn(),
}));

const mockedUsePwaInstall = vi.mocked(usePwaInstall);

describe("InstallPwaPrompt", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when no install is available", () => {
    mockedUsePwaInstall.mockReturnValue({
      status: "unavailable",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);
    expect(screen.queryByText("Install Momentum")).not.toBeInTheDocument();
  });

  it("renders nothing once already installed", () => {
    mockedUsePwaInstall.mockReturnValue({
      status: "installed",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);
    expect(screen.queryByText("Install Momentum")).not.toBeInTheDocument();
  });

  it("shows the prompt when an install is available", () => {
    mockedUsePwaInstall.mockReturnValue({
      status: "available",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);
    expect(screen.getByText("Install Momentum")).toBeInTheDocument();
  });

  it("calls promptInstall when Install is tapped", async () => {
    const promptInstall = vi.fn().mockResolvedValue("accepted");
    mockedUsePwaInstall.mockReturnValue({ status: "available", promptInstall });
    render(<InstallPwaPrompt />);

    await userEvent.click(screen.getByRole("button", { name: "Install" }));
    expect(promptInstall).toHaveBeenCalled();
  });

  it("hides itself and remembers the dismissal when the X is tapped", async () => {
    mockedUsePwaInstall.mockReturnValue({
      status: "available",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);

    await userEvent.click(
      screen.getByRole("button", { name: "Dismiss install prompt" }),
    );

    expect(screen.queryByText("Install Momentum")).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem("momentum-install-prompt-dismissed-at"),
    ).not.toBeNull();
  });

  it("stays hidden on a fresh mount if dismissed within the last 7 days", () => {
    window.localStorage.setItem(
      "momentum-install-prompt-dismissed-at",
      String(Date.now()),
    );
    mockedUsePwaInstall.mockReturnValue({
      status: "available",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);
    expect(screen.queryByText("Install Momentum")).not.toBeInTheDocument();
  });

  it("shows again once the dismissal cooldown has expired", () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(
      "momentum-install-prompt-dismissed-at",
      String(eightDaysAgo),
    );
    mockedUsePwaInstall.mockReturnValue({
      status: "available",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);
    expect(screen.getByText("Install Momentum")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    mockedUsePwaInstall.mockReturnValue({
      status: "available",
      promptInstall: vi.fn(),
    });
    const { container } = render(<InstallPwaPrompt />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
