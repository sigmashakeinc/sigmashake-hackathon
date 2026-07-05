import { expect, test } from "@playwright/test";

test("renders the hackathon mission-control surface", async ({ page }) => {
  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "SigmaShake Hackathon" })).toBeVisible();
  await expect(page.getByText("Progress Overview")).toBeVisible();
  await expect(page.getByRole("link", { name: "Submission", exact: true })).toBeVisible();
});
