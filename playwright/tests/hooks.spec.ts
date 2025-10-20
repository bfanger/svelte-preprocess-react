import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test.describe("hooks", () => {
  test("counter", async ({ page }) => {
    await page.goto("/hooks", { waitUntil: "networkidle" });
    await expect(page.getByTestId("count")).toHaveText("0");
    await page.getByTestId("add").click();
    await expect(page.getByTestId("count")).toHaveText("1");
    await page.getByTestId("add").click();
    await expect(page.getByTestId("count")).toHaveText("2");
  });

  test("authentication", async ({ page }) => {
    await page.goto("/hooks", { waitUntil: "networkidle" });
    await expect(page.getByTestId("not-authenticated")).toBeVisible();
    await expect(page.getByTestId("authenticated")).not.toBeVisible();
    await page.getByTestId("login").click();
    await expect(page.getByTestId("authenticated")).toBeVisible();
    await page.getByTestId("logout").click();
    await expect(page.getByTestId("not-authenticated")).toBeVisible();
  });
});
