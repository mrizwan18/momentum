import { expect, test } from "@playwright/test";

test("renders every dashboard.md section with honest empty states for a new user", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  for (const title of [
    "Streak",
    "Today's Score",
    "Today's One Thing",
    "Checklist",
    "Momentum",
    "Weekly Snapshot",
    "Roadmap",
    "Latest Achievement",
  ]) {
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }

  // A brand-new browser has no practice history — every data-backed
  // section should show its honest empty state, not fabricated content.
  await expect(page.getByText("No score yet")).toBeVisible();
  await expect(page.getByText("Nothing planned yet")).toBeVisible();
  await expect(page.getByText("No checklist yet")).toBeVisible();
  await expect(page.getByText("Momentum score coming soon")).toBeVisible();
  await expect(page.getByText("No practice yet this week")).toBeVisible();
  await expect(page.getByText("Your roadmap isn't ready yet")).toBeVisible();
  await expect(page.getByText("No achievements yet")).toBeVisible();

  await expect(
    page.getByRole("link", { name: "Start Practice" }),
  ).toBeVisible();
});
