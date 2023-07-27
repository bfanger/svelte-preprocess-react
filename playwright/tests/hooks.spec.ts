import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test.describe("hooks", () => {
  test("counter", async ({ page }) => {
    await page.goto("/hooks", { waitUntil: "networkidle" });
    await expect(page.locator('[data-testid="count"]')).toHaveText("0");
    await page.locator('[data-testid="add"]').click();
    await expect(page.locator('[data-testid="count"]')).toHaveText("1");
    await page.locator('[data-testid="add"]').click();
    await expect(page.locator('[data-testid="count"]')).toHaveText("2");
  });

  test("authentication", async ({ page }) => {
    await page.goto("/hooks", { waitUntil: "networkidle" });
    await expect(
      page.locator('[data-testid="not-authenticated"]'),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="authenticated"]'),
    ).not.toBeVisible();
    await page.locator('[data-testid="login"]').click();
    await expect(page.locator('[data-testid="authenticated"]')).toBeVisible();
    await page.locator('[data-testid="logout"]').click();
    await expect(
      page.locator('[data-testid="not-authenticated"]'),
    ).toBeVisible();
  });
});
