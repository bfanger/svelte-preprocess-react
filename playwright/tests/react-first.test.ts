import { test, expect, type Page } from "@playwright/test";
import svelteConfig from "../../svelte.config.js";

test.use({ viewport: { width: 480, height: 360 } });
test.describe("react-first", () => {
  test("render reactified Svelte component inside a React SPA", async ({
    page,
  }) => {
    await page.goto("/react-spa.html");
    await testDog(page);
    await testChildren(page);
    await testContext(page);
  });

  test("Hydrate reactified Svelte component inside React server rendered page", async ({
    page,
  }) => {
    await page.goto("/react-ssr?hydrate=1");
    await testDog(page);
    await testChildren(page);
    await testContext(page);
  });
});

test.describe("react-first no-js", () => {
  test.use({ javaScriptEnabled: false });
  if (svelteConfig?.compilerOptions?.css !== "injected") {
    test.skip();
  }
  test("Server render reactified Svelte component inside React server", async ({
    page,
  }) => {
    await page.goto("/react-ssr?css=1");
    // Only leaf nodes work (children are not supported)
    await testDog(page);
  });
});

async function testDog(page: Page) {
  await expect(page.getByText("Scooby")).toBeVisible();
  await expect(page.locator("svelte-dog")).toHaveScreenshot();
}

async function testChildren(page: Page) {
  await expect(
    page.locator(".wrapper", {
      hasText: "React element inside a reactified Svelte component",
    }),
  ).toHaveScreenshot();
}
async function testContext(page: Page) {
  await expect(
    page.locator("pre", { hasText: '"Svelte context value"' }),
  ).toHaveScreenshot();
}
