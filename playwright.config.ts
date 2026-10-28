import { defineConfig, devices } from "@playwright/test";

const channel = process.env.PLAYWRIGHT_CHROMIUM_CHANNEL;
const port = Number(process.env.PLAYWRIGHT_DOCS_PORT ?? 4417);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/docs",
  outputDir: "./test-results/docs",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: origin, trace: "retain-on-failure" },
  webServer: {
    command: `pnpm docs:preview --ignore-lock --port ${port}`,
    url: `${origin}/skills/`,
    reuseExistingServer: false,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1440, height: 900 },
        ...(channel ? { channel } : {}),
      },
    },
    { name: "webkit-mobile", use: { ...devices["iPhone 13"], browserName: "webkit" } },
  ],
});
