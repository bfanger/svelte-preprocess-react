import type { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    port: 5173,
    reuseExistingServer: true,
  },
};

export default config;
