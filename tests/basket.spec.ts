import { test, expect } from '@playwright/test';
import MainPage from '../pages/main.page';
import StartPage from '../pages/start.page';

const expectedAppTitle = 'OK-Notes';
const username = process.env.USER_NAME || "";
const password = process.env.PASSWORD || "";

test.beforeEach(async ({ page }) => {
  const startPage = new StartPage(page);
  const expectedBasketItemsCount = 0;

  await startPage.openPage();
  await expect(startPage.appTitle, `Expect title ${expectedAppTitle} to be present at the start page`).
    toHaveText(expectedAppTitle);
  const loginPage = await startPage.goToLogin();

  const mainPage = await loginPage.login(username, password);
  await expect(mainPage.basket, 'Expect basket to be visible at the main page after login').
    toBeVisible();

  await mainPage.clearBasket();
  expect(await mainPage.getBasketItemsCount(), `Expect basket items count to be ${expectedBasketItemsCount} after basket clearing`).
    toBe(expectedBasketItemsCount);
});

test('Go to the empty basket', async ({ page }) => {
  const mainPage = new MainPage(page);
  await mainPage.openBasket();
  await expect(mainPage.basketMenu, 'Expect basket dropdown menu to be visible after click on basket').
    toBeVisible();

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url(), `Expect page url to contain ${basketPage.path} after go to basket page`).
    toContain(basketPage.path);
  await expect(basketPage.appTitle, `Expect title ${expectedAppTitle} to be present at the basket page`).
    toHaveText(expectedAppTitle);
  await expect(basketPage.siteError, 'Expect basket page not to contain error message').not.toBeVisible();
});

test('Go to the basket with 1 item without discount', async ({ page }) => {
  const addedItem = { itemIndex: 0, hasDiscount: false };
  const expectedBasketItemsCount = 1;

  const mainPage = new MainPage(page);
  await mainPage.addItemToBasket(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketItemsCount(), `Expect basket items count to be ${expectedBasketItemsCount} after add 1 item`).
    toBe(expectedBasketItemsCount);

  await mainPage.openBasket();
  await expect(mainPage.basketMenu, 'Expect basket dropdown menu to be visible after click on basket').
    toBeVisible();

  expect(await mainPage.getBasketItemTitle(0), 'Expect basket item has correct title').
    toBe(await mainPage.getItemName(addedItem.itemIndex, addedItem.hasDiscount));
  expect(await mainPage.getBasketItemPrice(0), 'Expect basket item has correct price').
    toContain(await mainPage.getItemPrice(addedItem.itemIndex, addedItem.hasDiscount));

  const expectedPrice = await mainPage.getItemPriceValue(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketPriceValue(), `Expect total basket price to be ${expectedPrice}`).
    toBe(expectedPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url(), `Expect page url to contain ${basketPage.path} after go to basket page`).
    toContain(basketPage.path);
  await expect(basketPage.appTitle, `Expect title ${expectedAppTitle} to be present at the basket page`).
    toHaveText(expectedAppTitle);
  await expect(basketPage.siteError, 'Expect basket page not to contain error message').
    not.toBeVisible();
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
  expect(await mainPage.getBasketItemPrice(0)).
    toContain(await mainPage.getItemPrice(addedItem.itemIndex, addedItem.hasDiscount));

  const expectedPrice = await mainPage.getItemPriceValue(addedItem.itemIndex, addedItem.hasDiscount);
  expect(await mainPage.getBasketPriceValue()).toBe(expectedPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
  await expect(basketPage.siteError).not.toBeVisible();
});

test('Go to the basket with 9 different items', async ({ page }) => {
  const initialItem = { itemIndex: 0, hasDiscount: true };
  const expectedBasketItemsCount = 9;
  let expectedTotalPrice = 0;
  const mainPage = new MainPage(page);

  await mainPage.addItemToBasket(initialItem.itemIndex, initialItem.hasDiscount);
  expectedTotalPrice += await mainPage.getItemPriceValue(initialItem.itemIndex, initialItem.hasDiscount);

  for (let i = 0; i < (await mainPage.noteItemsWithDiscount.all()).length; i++) {
    await mainPage.addItemToBasket(i, true);
    expectedTotalPrice += await mainPage.getItemPriceValue(initialItem.itemIndex, initialItem.hasDiscount);
  }

  for (let i = 0; i < (await mainPage.noteItemsWithoutDiscount.all()).length; i++) {
    await mainPage.addItemToBasket(i, false);
    expectedTotalPrice += await mainPage.getItemPriceValue(initialItem.itemIndex, initialItem.hasDiscount);
  }

  expect(await mainPage.getBasketItemsCount()).toBe(expectedBasketItemsCount);
  await mainPage.openBasket();
  await expect(mainPage.basketMenu).toBeVisible();

  let checkedBasketItemIndex = 0;

  expect(await mainPage.getBasketItemTitle(checkedBasketItemIndex)).
    toBe(await mainPage.getItemName(initialItem.itemIndex, initialItem.hasDiscount));
  expect(await mainPage.getBasketItemPrice(checkedBasketItemIndex)).
    toContain(String(await mainPage.getItemPriceValue(initialItem.itemIndex, initialItem.hasDiscount) * 2));
  checkedBasketItemIndex++;

  for (let i = 1; i < (await mainPage.noteItemsWithDiscount.all()).length; i++) {
    expect(await mainPage.getBasketItemTitle(checkedBasketItemIndex)).toBe(await mainPage.getItemName(i, true));
    expect(await mainPage.getBasketItemPrice(checkedBasketItemIndex)).toContain(await mainPage.getItemPrice(i, true));
    checkedBasketItemIndex++;
  }

  for (let i = 0; i < (await mainPage.noteItemsWithoutDiscount.all()).length; i++) {
    expect(await mainPage.getBasketItemTitle(checkedBasketItemIndex)).toBe(await mainPage.getItemName(i, false));
    expect(await mainPage.getBasketItemPrice(checkedBasketItemIndex)).toContain(await mainPage.getItemPrice(i, false));
    checkedBasketItemIndex++;
  }

  expect(await mainPage.getBasketPriceValue()).toBe(expectedTotalPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
  await expect(basketPage.siteError).not.toBeVisible();
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

  const expectedTotalPrice =
    (await mainPage.getItemPriceValue(addedItem.itemIndex, addedItem.hasDiscount)) * expectedBasketItemsCount;
  expect(await mainPage.getBasketItemPrice(0)).toContain(String(expectedTotalPrice));
  expect(await mainPage.getBasketPriceValue()).toBe(expectedTotalPrice);

  const basketPage = await mainPage.clickGoToBasketPage();
  expect(page.url()).toContain(basketPage.path);
  await expect(basketPage.appTitle).toHaveText(expectedAppTitle);
  await expect(basketPage.siteError).not.toBeVisible();
});