import BasePage from "./base.page";
import { Page, Locator } from '@playwright/test';
import LoginPage from "./login.page";

export default class StartPage extends BasePage {
    readonly loginLink: Locator;

    constructor(page: Page) {
        super(page);
        this.loginLink = page.locator('//*[@href="/login"]');
    }

    async goToLogin() {
        await this.loginLink.click();
        await this.page.waitForLoadState('networkidle');
        return new LoginPage(this.page);
    }
}