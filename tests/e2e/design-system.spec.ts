import { expect, test } from "@playwright/test";

test("design system gallery renders every section without console errors", async ({
  page,
}) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("/design-system");

  await expect(
    page.getByRole("heading", { name: "Momentum Design System", level: 1 }),
  ).toBeVisible();

  const sections = [
    "Typography",
    "Spacing (Stack / Cluster)",
    "Theme Toggle",
    "Buttons",
    "Inputs",
    "Cards",
    "Dialogs",
    "Progress Ring",
    "Bottom Navigation",
    "Page Layout",
    "Loading Skeletons",
    "Empty & Error States",
    "Toast",
  ];
  for (const title of sections) {
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});

test("opens and closes a dialog from the gallery", async ({ page }) => {
  await page.goto("/design-system");

  await page.getByRole("button", { name: "Delete recording" }).click();
  await expect(
    page.getByRole("heading", { name: "Delete this recording?" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(
    page.getByRole("heading", { name: "Delete this recording?" }),
  ).toBeHidden();
});

test("toggling the theme updates data-theme on <html>", async ({ page }) => {
  await page.goto("/design-system");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("shows a toast when triggered from the gallery", async ({ page }) => {
  await page.goto("/design-system");

  await page.getByRole("button", { name: "Show success toast" }).click();
  await expect(page.getByText("Recording saved")).toBeVisible();
});
