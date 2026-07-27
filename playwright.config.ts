import { defineConfig, devices } from "@playwright/test";

const liveUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./tests",
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    baseURL: liveUrl ?? "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"], browserName: "chromium" } },
  ],
  webServer: liveUrl
    ? undefined
    : {
        command: "npm run start -- -p 3100",
        url: "http://127.0.0.1:3100",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
