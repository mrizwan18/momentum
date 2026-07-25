import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { PersonalRecordsCard } from "./PersonalRecordsCard";
import type { PersonalRecords } from "../lib/personal-records";

const records: PersonalRecords = {
  longestSessionSeconds: 930,
  bestDailyScore: 88,
  mostExercisesInSession: 7,
  longestStreak: 12,
  bestPracticeDayMinutes: 75,
};

describe("PersonalRecordsCard", () => {
  it("shows every record", () => {
    render(<PersonalRecordsCard records={records} />);
    expect(screen.getByText("12 days")).toBeInTheDocument();
    expect(screen.getByText("15:30")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("75 min")).toBeInTheDocument();
  });

  it("shows a dash for best score when there is none yet", () => {
    render(
      <PersonalRecordsCard records={{ ...records, bestDailyScore: null }} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("uses singular 'day' for a 1-day streak", () => {
    render(<PersonalRecordsCard records={{ ...records, longestStreak: 1 }} />);
    expect(screen.getByText("1 day")).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PersonalRecordsCard records={records} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
