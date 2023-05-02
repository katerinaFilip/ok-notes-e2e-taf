import BasePage from "./base.page";
import BasketPage from "./basket.page";
import { Page, Locator, expect } from '@playwright/test';
import Parser from "../utils/parser";

export default class MainPage extends BasePage {
    readonly basket: Locator;
    readonly basketMenu: Locator;
    readonly basketItemsCount: Locator;
    readonly clearBasketButton: Locator;
    readonly goToBasketPageButton: Locator;
    readonly noteItemsWithoutDiscount: Locator;
    readonly noteItemsWithDiscount: Locator;
    readonly basketItemsTitles: Locator;
    readonly basketItemsPrices: Locator;
    readonly basketPrice: Locator;

    constructor(page: Page) {
        super(page);
        this.basket = page.locator('a#dropdownBasket');
        this.basketItemsCount = page.locator('//*[@class="basket-count-items badge badge-primary"]');
        this.basketMenu = page.locator('//li[@id="basketContainer"]/*[@class="dropdown-menu dropdown-menu-right show"]');
        this.basketItemsTitles = this.basketMenu.locator('.basket-item-title');
        this.basketItemsPrices = this.basketMenu.locator('.basket-item-price');
        this.basketPrice = this.basketMenu.locator('.basket_price');
        this.clearBasketButton = this.basketMenu.locator('a.btn-danger');
        this.goToBasketPageButton = this.basketMenu.locator('a.btn-primary');
        this.noteItemsWithoutDiscount = page.locator('//div[@class="note-list row"]//div[(contains(@class,"note-item card")) and not(contains(@class,"hasDiscount"))]');
        this.noteItemsWithDiscount = page.locator('//div[@class="note-list row"]//div[(contains(@class,"note-item card")) and (contains(@class,"hasDiscount"))]');
    }

    async getBasketItemsCount(): Promise<number> {
        await expect(this.basketItemsCount, "Waiting for basket items count to have numeric value").
            toHaveText(/\d+/, { timeout: 2000 });
        const countValue = await this.basketItemsCount.textContent();
        return Number(countValue);
    }

    async openBasket() {
        await this.basket.click();
    }

    async getNoteItem(index: number, hasDiscount: boolean) {
        const noteItems = hasDiscount ? this.noteItemsWithDiscount : this.noteItemsWithoutDiscount;
        return noteItems.nth(index);
    }

    async addItemToBasket(index: number, hasDiscount: boolean) {
        const prevBasketItemsCount = await this.basketItemsCount.textContent() || "";
        const note = await this.getNoteItem(index, hasDiscount);
        const buyButton = note.locator('button.actionBuyProduct');

        await buyButton.click();
        await expect(this.basketItemsCount, `Waiting for basket items count not to have text ${prevBasketItemsCount}`).
            not.toHaveText(prevBasketItemsCount, { timeout: 1000 });
    }

    /* В качестве альтернативы очистки корзины при помощи кнопки Очистить корзину можно было бы использовать отправку 
    post-запроса на https://enotes.pointschool.ru/basket/clear с пустым body (именно это происходит при нажатии кнопки Очистить корзину). 
    При этом актуальный csrf-token можно взять из значения аттрибута content элемента с селектором [name="csrf-token"].
    Такой способ очистки корзины может немного ускорить тесты и помочь избавиться от зависимостей в прохождении тестов (на данный момент
    если в корзине 9 элементов, при попытке открыть корзину выпадает 500 ошибка и дальнейшие действия с корзиной не возможны).
    С другой стороны очистка корзины через UI позволит на этапе предусловий дополнительно проверить эту функциональность, поэтому 
    такой способ и был реализован.
     */
    async clearBasket() {
        const basketItemsCount = await this.getBasketItemsCount();

        if (basketItemsCount > 0) {
            const expectedBasketItemsCount = '0';

            await this.openBasket();
            await expect(this.basketMenu, 'Waiting for basket dropdown menu to be visible after click on basket').
                toBeVisible({ timeout: 1000 });
            await this.clearBasketButton.click();
            await expect(this.basketItemsCount, `Waiting for basket items count to have text ${expectedBasketItemsCount}`).
                toHaveText(expectedBasketItemsCount, { timeout: 1000 });
        }
    }

    async clickGoToBasketPage() {
        await this.goToBasketPageButton.click();
        await this.page.waitForLoadState('networkidle');

        return new BasketPage(this.page);
    }

    async getItemName(index: number, hasDiscount: boolean) {
        const note = await this.getNoteItem(index, hasDiscount);
        const productName = note.locator('div.product_name');

        return await productName.textContent();
    }

    async getItemPrice(index: number, hasDiscount: boolean) {
        const note = await this.getNoteItem(index, hasDiscount);
        const productPrice = note.locator('.product_price');

        return Parser.getActualPrice(await productPrice.textContent());
    }

    async getItemPriceValue(index: number, hasDiscount: boolean) {
        return Parser.getPriceValue(await this.getItemPrice(index, hasDiscount));
    }

    async getBasketItemTitle(itemIndex: number) {
        return await this.basketItemsTitles.nth(itemIndex).textContent();
    }

    async getBasketItemPrice(itemIndex: number) {
        return await this.basketItemsPrices.nth(itemIndex).textContent();
    }

    async getBasketPriceValue() {
        return Parser.getPriceValue(await this.basketPrice.textContent());
    }
}