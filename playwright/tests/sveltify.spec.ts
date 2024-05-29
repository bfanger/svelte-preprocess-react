import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test.describe("sveltify", () => {
  test("props", async ({ page }) => {
    await page.goto("/playwright");
    await expect(page.locator("text=Ready")).toBeVisible();
    await page.evaluate(() => {
      const win = window as any;
      const target = document.getElementById("playground");
      if (win.app) {
        win.svelteUnmount(win.app);
      }
      win.app = win.svelteMount(win.StatefulClicker, {
        target,
        props: { ReactDOM: win.ReactDOM },
      });
    });
    const message = page.locator('[data-testid="message"]');
    await expect(message).toContainText("You clicked 0 times");
    await page.click("text=+");
    await expect(message).toContainText("You clicked 1 times");
    await page.click("text=+");
    await page.click("text=+");
    await expect(message).toContainText("You clicked 3 times");
  });

  test("react context", async ({ page }) => {
    await page.goto("/context-react");
    await expect(
      page.getByRole("heading", { name: "Hello from react context" }),
    ).toBeVisible();
  });

  test("svelte context", async ({ page }) => {
    await page.goto("/context-svelte");
    await expect(
      page.locator('text=/.*"Hello from svelte route".*/'),
    ).toBeVisible();
  });
});
