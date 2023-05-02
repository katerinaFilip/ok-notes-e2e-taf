import BasePage from "./base.page";
import { Page, Locator } from '@playwright/test';
import MainPage from "./main.page";

export default class LoginPage extends BasePage {
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly path: string;

    constructor(page: Page) {
        super(page);
        this.path = '/login';
        this.usernameInput = page.locator('input#loginform-username'); //при дальнейшем увеличении количества элементов с таким видом селекторов можно сделать их более универсальными и вынести в base page: (`input#${inputName}`);
        this.passwordInput = page.locator('input#loginform-password');
        this.loginButton = page.locator('//button[@type="submit"]');
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.type(password);
        await this.loginButton.click();
        await this.page.waitForLoadState('networkidle');
        return new MainPage(this.page);
    }
}