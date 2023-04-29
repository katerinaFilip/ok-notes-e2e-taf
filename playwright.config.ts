import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import BrowserFactory from './utils/browser.factory';
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ["html"],
    ["line"],
    [
      "allure-playwright",
      {
        detail: true,
        outputFolder: "allure-report",
        suiteTitle: true,
      },
    ],
  ],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },

  projects: [
    BrowserFactory.getBrowserObject()
  ],
});
