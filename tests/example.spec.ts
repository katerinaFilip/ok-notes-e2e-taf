import { test, expect } from '@playwright/test';
import BasePage from '../pages/base.page';

test('Go to empty cart', async ({ page }) => {
  let basePage = new BasePage(page);

  await basePage.openPage();
  expect(basePage.appTitle).toHaveValue('OK-Notes');
});
