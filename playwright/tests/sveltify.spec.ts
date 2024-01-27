import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test.describe("sveltify", () => {
  test("props", async ({ page }) => {
    await page.goto("/playwright");
    await expect(page.locator("text=Ready")).toBeVisible();
    await page.evaluate(() => {
      const win = window as any;
      const target = document.getElementById("playground");
      win.app = win.svelteCreateRoot(win.Clicker, {
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

  test("react context", async ({ page }) => {
    await page.goto("/context-react");
    await expect(
      page.locator('text="Hello from react context provider"'),
    ).toBeVisible();
  });

  test("svelte context", async ({ page }) => {
    await page.goto("/context-svelte");
    await expect(
      page.locator('text=/.*"Hello from svelte route".*/'),
    ).toBeVisible();
  });
});
