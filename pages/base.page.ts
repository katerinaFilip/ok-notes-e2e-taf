import { Page, Locator } from '@playwright/test';

export default class BasePage {
    readonly page: Page;
    readonly appTitle: Locator;
    readonly path: string;

    constructor(page: Page) {
        this.page = page;
        this.appTitle = page.locator('a.navbar-brand');
        this.path = '';
    }

    async openPage() {
        await this.page.goto(`/${this.path}`);
        await this.page.waitForLoadState('networkidle');
    }
}