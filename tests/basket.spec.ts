import { test, expect } from '@playwright/test';
import MainPage from '../pages/main.page';
import StartPage from '../pages/start.page';

const expectedAppTitle = 'OK-Notes';

test.beforeEach(async ({ page }) => {
  const startPage = new StartPage(page);
  const expectedBasketItemsCount = 0;

  await startPage.openPage();
  await expect(startPage.appTitle).toHaveText(expectedAppTitle);
  const loginPage = await startPage.goToLogin();

  const mainPage = await loginPage.login('test', 'test');
  await expect(mainPage.basket).toBeVisible();

  await mainPage.clearBasket();
  expect(await mainPage.getBasketItemsCount()).toBe(expectedBasketItemsCount);
});

test('Go to the empty basket', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.openBasket();
  await expect(mainPage.basketMenu).toBeVisible();

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
});

test('Go to the basket with 1 item without discount', async ({ page }) => {
  const addedItem = { itemIndex: 0, hasDiscount: false };
  const expectedBasketItemsCount = 1;

  const mainPage = new MainPage(page);
  await mainPage.addItemToBasket(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketItemsCount()).toBe(expectedBasketItemsCount);

  await mainPage.openBasket();
  await expect(mainPage.basketMenu).toBeVisible();

  expect(await mainPage.getBasketItemTitle(0)).
    toBe(await mainPage.getItemName(addedItem.itemIndex, addedItem.hasDiscount));
  expect(await mainPage.getBasketItemPrice(addedItem.itemIndex)).
    toContain(await mainPage.getItemPrice(addedItem.itemIndex, addedItem.hasDiscount));

  const expectedPrice = await mainPage.getItemPriceValue(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketPriceValue()).toBe(expectedPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
});

test('Go to the basket with 1 item with discount', async ({ page }) => {
  const addedItem = { itemIndex: 1, hasDiscount: true };
  const expectedBasketItemsCount = 1;

  const mainPage = new MainPage(page);
  await mainPage.addItemToBasket(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketItemsCount()).toBe(expectedBasketItemsCount);

  await mainPage.openBasket();
  await expect(mainPage.basketMenu).toBeVisible();

  expect(await mainPage.getBasketItemTitle(0)).
    toBe(await mainPage.getItemName(addedItem.itemIndex, addedItem.hasDiscount));
  expect(await mainPage.getBasketItemPrice(addedItem.itemIndex)).
    toContain(await mainPage.getItemPrice(addedItem.itemIndex, addedItem.hasDiscount));

  const expectedPrice = await mainPage.getItemPriceValue(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketPriceValue()).toBe(expectedPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
});

test('Go to the basket with 9 identical items with discount', async ({ page }) => {
  const addedItem = { itemIndex: 0, hasDiscount: true };
  const expectedBasketItemsCount = 9;

  const mainPage = new MainPage(page);
  for (let i = 0; i < expectedBasketItemsCount; i++) {
    await mainPage.addItemToBasket(addedItem.itemIndex, addedItem.hasDiscount);
  }
  expect(await mainPage.getBasketItemsCount()).toBe(expectedBasketItemsCount);

  await mainPage.openBasket();
  await expect(mainPage.basketMenu).toBeVisible();

  expect(await mainPage.getBasketItemTitle(0)).
    toBe(await mainPage.getItemName(addedItem.itemIndex, addedItem.hasDiscount));

  const expectedTotalPrice = (await mainPage.getItemPriceValue(addedItem.itemIndex, addedItem.hasDiscount)) * expectedBasketItemsCount;
  expect(await mainPage.getBasketItemPrice(addedItem.itemIndex)).toContain(String(expectedTotalPrice));
  expect(await mainPage.getBasketPriceValue()).toBe(expectedTotalPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
});