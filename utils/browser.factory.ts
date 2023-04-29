import { devices } from "@playwright/test";

export default class BrowserFactory {
    static getBrowserObject() {
        const browserName = process.env.BROWSER;

        switch (browserName) {
            case 'chromium':
                return {
                    name: browserName,
                    use: { ...devices['Desktop Chrome'] },
                }
            case 'firefox':
                return {
                    name: browserName,
                    use: { ...devices['Desktop Firefox'] },
                }
            case 'webkit':
                return {
                    name: browserName,
                    use: { ...devices['Desktop Safari'] },
                }
            default:
                return {
                    name: 'chromium',
                    use: { ...devices['Desktop Chrome'] },
                }
        }
    }
}