import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NotificationOptInPrompt } from "./NotificationOptInPrompt";
import { usePushSubscription } from "@/hooks/use-push-subscription";

vi.mock("@/hooks/use-push-subscription", () => ({
  usePushSubscription: vi.fn(),
}));

const mockedUsePushSubscription = vi.mocked(usePushSubscription);

const engagement = { currentStreak: 4, lastPracticedDate: "2026-07-25" };

describe("NotificationOptInPrompt", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when the browser doesn't support push", () => {
    mockedUsePushSubscription.mockReturnValue({
      status: "unsupported",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);
    expect(
      screen.queryByText("Never lose your streak"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing once already subscribed", () => {
    mockedUsePushSubscription.mockReturnValue({
      status: "subscribed",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);
    expect(
      screen.queryByText("Never lose your streak"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when permission was permanently denied", () => {
    mockedUsePushSubscription.mockReturnValue({
      status: "denied",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);
    expect(
      screen.queryByText("Never lose your streak"),
    ).not.toBeInTheDocument();
  });

  it("shows the prompt when permission hasn't been decided yet", () => {
    mockedUsePushSubscription.mockReturnValue({
      status: "default",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);
    expect(screen.getByText("Never lose your streak")).toBeInTheDocument();
  });

  it("calls subscribe with the given engagement snapshot when Enable is tapped", async () => {
    const subscribe = vi.fn().mockResolvedValue(true);
    mockedUsePushSubscription.mockReturnValue({
      status: "default",
      subscribe,
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);

    await userEvent.click(screen.getByRole("button", { name: "Enable" }));

    expect(subscribe).toHaveBeenCalledWith(engagement);
  });

  it("dismisses and remembers the dismissal for this session when X is tapped", async () => {
    mockedUsePushSubscription.mockReturnValue({
      status: "default",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Dismiss notification prompt" }),
    );

    expect(
      screen.queryByText("Never lose your streak"),
    ).not.toBeInTheDocument();
    expect(
      window.sessionStorage.getItem("momentum-notification-prompt-dismissed"),
    ).toBe("1");
  });

  it("dismisses itself if the permission prompt ends up denied", async () => {
    const subscribe = vi.fn().mockResolvedValue(false);
    mockedUsePushSubscription.mockReturnValue({
      status: "default",
      subscribe,
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);

    await userEvent.click(screen.getByRole("button", { name: "Enable" }));

    expect(
      screen.queryByText("Never lose your streak"),
    ).not.toBeInTheDocument();
  });

  it("stays hidden on a fresh mount within the same session", () => {
    window.sessionStorage.setItem(
      "momentum-notification-prompt-dismissed",
      "1",
    );
    mockedUsePushSubscription.mockReturnValue({
      status: "default",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    render(<NotificationOptInPrompt engagement={engagement} />);
    expect(
      screen.queryByText("Never lose your streak"),
    ).not.toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    mockedUsePushSubscription.mockReturnValue({
      status: "default",
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
    });
    const { container } = render(
      <NotificationOptInPrompt engagement={engagement} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
