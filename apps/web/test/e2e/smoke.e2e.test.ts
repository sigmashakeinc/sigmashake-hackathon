import { expect, test } from "@playwright/test";

test("renders the hackathon operations surface", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "SigmaShake Hackathon" })).toBeVisible();
  await expect(page.getByLabel("Runtime status")).toBeVisible();
});
