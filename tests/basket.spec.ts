import { test, expect } from '@playwright/test';
import MainPage from '../pages/main.page';
import StartPage from '../pages/start.page';


test.beforeEach(async ({ page }) => {
  const startPage = new StartPage(page);

  await startPage.openPage();
  await expect(startPage.appTitle).toHaveText('OK-Notes');
  const loginPage = await startPage.goToLogin();

  const mainPage = await loginPage.login('test', 'test');
  await expect(mainPage.basket).toBeVisible();

  await mainPage.clearBasket();
  expect(await mainPage.getBasketItemsCount()).toBe(0);
});

test('Go to empty cart', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.openBasket();
  await expect(mainPage.basketMenu).toBeVisible();
});
