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
    window.sessionStorage.clear();
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

  it("hides itself and remembers the dismissal for this session", async () => {
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
      window.sessionStorage.getItem("momentum-install-prompt-dismissed"),
    ).toBe("1");
  });

  it("stays hidden on a fresh mount within the same session", () => {
    window.sessionStorage.setItem("momentum-install-prompt-dismissed", "1");
    mockedUsePwaInstall.mockReturnValue({
      status: "available",
      promptInstall: vi.fn(),
    });
    render(<InstallPwaPrompt />);
    expect(screen.queryByText("Install Momentum")).not.toBeInTheDocument();
  });

  it("shows again in a new session (sessionStorage cleared) even if dismissed before", () => {
    window.sessionStorage.setItem("momentum-install-prompt-dismissed", "1");
    window.sessionStorage.clear();
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
