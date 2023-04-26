import BasePage from "./base.page";
import { Page, Locator } from '@playwright/test';

export default class MainPage extends BasePage {
    readonly basket: Locator;
    readonly basketMenu: Locator;
    readonly basketItemsCount: Locator;
    readonly clearBasketButton: Locator;

    constructor(page: Page) {
        super(page);
        this.basket = page.locator('a#dropdownBasket');
        this.basketMenu = page.locator('//li[@id="basketContainer"]/*[@class="dropdown-menu dropdown-menu-right show"]');
        this.basketItemsCount = page.locator('//*[@class="basket-count-items badge badge-primary"]');
        this.clearBasketButton = page.locator('a.btn-danger');
    }

    async getBasketItemsCount(): Promise<number> {
        const countValue = await this.basketItemsCount.innerText();
        return Number(countValue);
    }

    async openBasket() {
        await this.basket.click();
    }

    async clearBasket() {
        if (await this.getBasketItemsCount() > 0) {
            await this.openBasket();
            await this.clearBasketButton.click();
        }
    }
}