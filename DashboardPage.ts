import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // Selectors with fallbacks
  private get dashboardContainer(): Locator {
    const selectors = [
      '.dashboard',
      '#dashboard',
      '[data-testid="dashboard"]',
      '.main-content',
      '.app-content',
      '.dashboard-content'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get userMenu(): Locator {
    const selectors = [
      '.user-menu',
      '.profile-dropdown',
      '[data-testid="user-menu"]',
      '.avatar',
      '.user-avatar',
      '.profile-avatar'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get navigationMenu(): Locator {
    const selectors = [
      '.nav',
      '.navigation',
      '.sidebar',
      '[data-testid="navigation"]',
      '.main-nav',
      '.side-nav'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get logoutButton(): Locator {
    const selectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      'a:has-text("Logout")',
      '[data-testid="logout"]',
      '.logout-button'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  private get appsSection(): Locator {
    const selectors = [
      '.apps',
      '#apps',
      '[data-testid="apps"]',
      '.applications',
      '.app-list'
    ];
    
    return this.findElementWithFallbacks(selectors);
  }

  // Navigation
  async navigate(): Promise<void> {
    await super.navigate('/dashboard');
    await this.waitForPageLoad();
  }

  // Actions
  async waitForDashboard(): Promise<void> {
    await (await this.dashboardContainer).waitFor({ state: 'visible', timeout: 15000 });
  }

  async openUserMenu(): Promise<void> {
    await (await this.userMenu).click();
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await (await this.logoutButton).click();
  }

  async navigateToApps(): Promise<void> {
    await (await this.appsSection).click();
  }

  // Validations
  async expectDashboardLoaded(): Promise<void> {
    await this.expectElementVisible(await this.dashboardContainer);
    await this.expectElementVisible(await this.navigationMenu);
  }

  async expectUserLoggedIn(): Promise<void> {
    await this.expectElementVisible(await this.userMenu);
  }

  // Getters
  async getUserName(): Promise<string | null> {
    try {
      return await (await this.userMenu).textContent();
    } catch {
      return null;
    }
  }

  async isDashboardLoaded(): Promise<boolean> {
    try {
      await this.expectDashboardLoaded();
      return true;
    } catch {
      return false;
    }
  }
}
