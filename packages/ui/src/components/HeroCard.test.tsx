import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Music } from "lucide-react";
import { HeroCard } from "./HeroCard";

describe("HeroCard", () => {
  it("renders the eyebrow, value, unit, and caption", () => {
    render(
      <HeroCard
        icon={<Music />}
        eyebrow="Today's Practice"
        value={47}
        unit="minutes"
        caption="Goal: 60 min"
      />,
    );
    expect(screen.getByText("Today's Practice")).toBeInTheDocument();
    expect(screen.getByText("47")).toBeInTheDocument();
    expect(screen.getByText("minutes")).toBeInTheDocument();
    expect(screen.getByText("Goal: 60 min")).toBeInTheDocument();
  });

  it("omits the unit and caption when not provided", () => {
    render(<HeroCard eyebrow="Today's Practice" value={47} />);
    expect(screen.queryByText("minutes")).not.toBeInTheDocument();
  });

  it("renders an optional bleeding image", () => {
    render(
      <HeroCard
        eyebrow="Today's Practice"
        value={47}
        imageSrc="/singer.png"
        imageAlt="Riyaaz singing"
      />,
    );
    expect(screen.getByAltText("Riyaaz singing")).toBeInTheDocument();
  });

  it("calls onAction when the floating action button is pressed", async () => {
    const onAction = vi.fn();
    render(
      <HeroCard
        eyebrow="Today's Practice"
        value={47}
        onAction={onAction}
        actionLabel="Start practice"
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Start practice" }),
    );
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <HeroCard
        icon={<Music />}
        eyebrow="Today's Practice"
        value={47}
        unit="minutes"
        onAction={vi.fn()}
        actionLabel="Start practice"
      />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
