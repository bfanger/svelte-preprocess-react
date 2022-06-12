import type { PlaywrightTestConfig } from "@playwright/test";

const baseURL = "http://localhost:3000";
const nodeVersion = parseInt(process.version.match(/v([0-9]+)\./)[1], 10);
// https://github.com/nodejs/node/issues/40702
const webServer =
  nodeVersion >= 17
    ? undefined
    : {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
      };
/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer,
};

export default config;
