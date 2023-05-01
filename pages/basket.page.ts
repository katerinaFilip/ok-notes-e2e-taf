import BasePage from "./base.page";
import { Page } from '@playwright/test';

export default class BasketPage extends BasePage {
    readonly path: string;

    constructor(page: Page) {
        super(page);
        this.path = '/basket';
    }
}