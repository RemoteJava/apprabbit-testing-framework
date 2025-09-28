import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  // Selectors with fallbacks (auto-generated from discovery)
  private get emailInput(): Locator {
    const selectors = [
      'input[type="email"]',
      'input[name="email"]',
      '#email',
      '.email-input',
      '[data-testid="email"]',
      'input[placeholder*="email" i]'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get passwordInput(): Locator {
    const selectors = [
      'input[type="password"]',
      'input[name="password"]',
      '#password',
      '.password-input',
      '[data-testid="password"]',
      'input[placeholder*="password" i]'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get loginButton(): Locator {
    const selectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '.login-button',
      '#login-btn',
      '[data-testid="login-button"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")',
      'button:has-text("Log In")'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get errorMessage(): Locator {
    const selectors = [
      '.error',
      '.alert-danger',
      '.error-message',
      '[data-testid="error"]',
      '.notification.error',
      '.toast.error',
      '.alert.error'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get forgotPasswordLink(): Locator {
    const selectors = [
      'a[href*="forgot"]',
      '.forgot-password',
      '[data-testid="forgot-password"]',
      'a:has-text("Forgot")',
      'a:has-text("Reset")'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  // Navigation
  async navigate(): Promise<void> {
    await super.navigate('/login');
    await this.waitForPageLoad();
  }

  // Actions
  async login(email: string, password: string): Promise<void> {
    await (await this.emailInput).fill(email);
    await (await this.passwordInput).fill(password);
    await (await this.loginButton).click();
  }

  async loginWithValidCredentials(): Promise<void> {
    const email = process.env.APPRABBIT_TEST_EMAIL || 'test@example.com';
    const password = process.env.APPRABBIT_TEST_PASSWORD || 'password123';
    
    await this.login(email, password);
  }

  async loginWithInvalidCredentials(): Promise<void> {
    await this.login('invalid@email.com', 'wrongpassword');
  }

  async clickForgotPassword(): Promise<void> {
    await (await this.forgotPasswordLink).click();
  }

  // Validations
  async expectLoginFormVisible(): Promise<void> {
    await this.expectElementVisible(await this.emailInput);
    await this.expectElementVisible(await this.passwordInput);
    await this.expectElementVisible(await this.loginButton);
  }

  async expectErrorMessage(expectedMessage?: string): Promise<void> {
    await this.expectElementVisible(await this.errorMessage);
    
    if (expectedMessage) {
      const actualMessage = await (await this.errorMessage).textContent();
      if (!actualMessage?.includes(expectedMessage)) {
        throw new Error(`Expected error message to contain "${expectedMessage}", but got "${actualMessage}"`);
      }
    }
  }

  async expectRedirectAfterLogin(expectedUrl?: string): Promise<void> {
    // Wait for redirect after successful login
    await this.page.waitForURL(url => !url.includes('/login'), { timeout: 10000 });
    
    if (expectedUrl) {
      await this.expectUrl(expectedUrl);
    }
  }

  // Getters for test validation
  async getErrorMessage(): Promise<string | null> {
    try {
      return await (await this.errorMessage).textContent();
    } catch {
      return null;
    }
  }

  async isLoginFormVisible(): Promise<boolean> {
    try {
      await this.expectLoginFormVisible();
      return true;
    } catch {
      return false;
    }
  }
}
