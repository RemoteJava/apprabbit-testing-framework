import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    const baseUrl = process.env.APPRABBIT_BASE_URL || 'https://app.apprabbit.com';
    await this.page.goto(`${baseUrl}${path}`);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({ 
      path: `reports/ui/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  // Enhanced selector methods with fallbacks
  protected async findElementWithFallbacks(selectors: string[]): Promise<Locator> {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        await element.waitFor({ timeout: 5000 });
        return element;
      } catch {
        continue;
      }
    }
    
    throw new Error(`Could not find element with any of these selectors: ${selectors.join(', ')}`);
  }

  // Wait utilities
  async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ timeout });
    return element;
  }

  async waitForText(text: string, timeout: number = 10000): Promise<void> {
    await this.page.getByText(text).waitFor({ timeout });
  }

  // Common actions
  async clickElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.click();
  }

  async fillInput(selector: string, value: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.fill(value);
  }

  async selectOption(selector: string, value: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.selectOption(value);
  }

  // Validation helpers
  async expectElementVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  async expectPageTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(title);
  }

  async expectUrl(url: string): Promise<void> {
    await expect(this.page).toHaveURL(url);
  }
}
