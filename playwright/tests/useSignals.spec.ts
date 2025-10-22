import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test("useSignals", async ({ page }) => {
  await page.goto("/signals", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Hello John" })).toBeVisible();
  await page.getByRole("textbox", { name: "Enter your name" }).fill("James");
  await expect(
    page.getByRole("heading", { name: "Hello James" }),
  ).toBeVisible();
});
