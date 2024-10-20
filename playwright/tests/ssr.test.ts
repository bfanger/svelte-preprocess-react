import { test, expect } from "@playwright/test";
import { copyFile, readdir, stat } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

test.describe.configure({ mode: "serial" });
test.use({ viewport: { width: 480, height: 360 } });
test.describe("ssr", () => {
  const urls = ["/context-svelte", "/context-react", "/preprocessor"];

  test("client-rendered", async ({ page }) => {
    // Create Screenshots using Client Side Rendering.
    for (const url of urls) {
      await page.goto(url);
      await expect(page.locator('body[data-ssr="spa"]')).toBeAttached({
        timeout: 10_000,
      });
      await expect(page.locator("body")).toHaveScreenshot();
    }
  });

  test("sync screenshots", async () => {
    // Copy client-rendered screenshots to be used as reference for server-rendered snapshots.
    const snapshotsPath = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "ssr.test.ts-snapshots",
    );
    const files = await readdir(snapshotsPath);
    let checked = 0;
    for (const file of files) {
      if (file.match(/client-rendered/)) {
        const clientFile = path.join(snapshotsPath, file);
        const serverFile = path.join(
          snapshotsPath,
          file.replace("client-rendered", "no-js-server-rendered"),
        );
        const serverInfo = await stat(serverFile).catch(() => false as const);
        if (!serverInfo) {
          await copyFile(clientFile, serverFile);
        } else {
          const clientInfo = await stat(clientFile);
          if (clientInfo.size !== serverInfo.size) {
            await copyFile(clientFile, serverFile);
          }
        }
        checked++;
      }
    }
    expect(checked).toBe(urls.length);
  });
  test.describe("no-js", () => {
    test.use({ javaScriptEnabled: false });
    test("server-rendered", async ({ page }) => {
      for (const url of urls) {
        await page.goto(url);
        await expect(page.locator("body")).toHaveScreenshot();
      }
    });
  });
});
