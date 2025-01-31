import { test, expect } from "@playwright/test";

test.use({ viewport: { width: 480, height: 360 } });
test.describe("react.html", () => {
  test("should render the reactified Svelte component inside a React app", async ({
    page,
  }) => {
    await page.goto("/react.html");
    await expect(page.getByText("Scooby")).toBeVisible();
    await expect(page.locator("body")).toHaveScreenshot();
  });
});
