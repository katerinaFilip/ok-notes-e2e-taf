import { Page, Locator } from '@playwright/test';

export default class BasePage {
    readonly page: Page;
    readonly appTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.appTitle = page.locator('a.navbar-brand');
    }

    async openPage() {
        await this.page.goto('https://playwright.dev');
    }
}