import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test.beforeEach(async ({ page }) => {
  await page.goto("/playwright");
  await expect(page.locator("text=Ready")).toBeVisible();
});
test.describe("sveltifyReact", () => {
  test("props", async ({ page }) => {
    await page.evaluate(function mount() {
      const win = window as any;
      const target = document.getElementById("playground");
      win.app = new win.Clicker({
        target,
        props: {
          count: 123,
          onCount(count) {
            win.app.$set({ count });
          },
        },
      });
    });
    const message = page.locator('[data-testid="message"]');
    await expect(message).toContainText("You clicked 123 times");
    await page.click("text=+");
    await expect(message).toContainText("You clicked 124 times");
    await page.evaluate("app.$set({ count: 200 })");
    await expect(message).toContainText("You clicked 200 times");
  });
});
