import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

interface DiscoveredSelector {
  name: string;
  selector: string;
  fallbackSelectors: string[];
  elementType: string;
  isVisible: boolean;
  hasText?: string;
}

interface PageObjectData {
  pageName: string;
  url: string;
  selectors: DiscoveredSelector[];
}

class SelectorDiscovery {
  private browser!: Browser;
  private page!: Page;
  private discoveredPages: PageObjectData[] = [];

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
  }

  async discoverLoginPage(): Promise<void> {
    console.log('🔍 Discovering Login Page selectors...');
    
    const baseUrl = process.env.APPRABBIT_BASE_URL || 'https://app.apprabbit.com';
    await this.page.goto(`${baseUrl}/login`);
    
    const loginSelectors: DiscoveredSelector[] = [];

    // Email input field
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      '#email',
      '.email-input',
      '[data-testid="email"]',
      'input[placeholder*="email" i]'
    ];
    
    const emailElement = await this.findBestSelector(emailSelectors, 'Email Input');
    if (emailElement) loginSelectors.push(emailElement);

    // Password input field
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      '#password',
      '.password-input',
      '[data-testid="password"]',
      'input[placeholder*="password" i]'
    ];
    
    const passwordElement = await this.findBestSelector(passwordSelectors, 'Password Input');
    if (passwordElement) loginSelectors.push(passwordElement);

    // Login button
    const loginButtonSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '.login-button',
      '#login-btn',
      '[data-testid="login-button"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")'
    ];
    
    const loginButton = await this.findBestSelector(loginButtonSelectors, 'Login Button');
    if (loginButton) loginSelectors.push(loginButton);

    // Error message container
    const errorSelectors = [
      '.error',
      '.alert-danger',
      '.error-message',
      '[data-testid="error"]',
      '.notification.error',
      '.toast.error'
    ];
    
    const errorElement = await this.findBestSelector(errorSelectors, 'Error Message');
    if (errorElement) loginSelectors.push(errorElement);

    this.discoveredPages.push({
      pageName: 'LoginPage',
      url: '/login',
      selectors: loginSelectors
    });
  }

  async discoverDashboardPage(): Promise<void> {
    console.log('🔍 Discovering Dashboard Page selectors...');
    
    // Navigate to dashboard (may require login first)
    const dashboardSelectors: DiscoveredSelector[] = [];

    // Common dashboard elements
    const dashboardElementSelectors = [
      '.dashboard',
      '#dashboard',
      '[data-testid="dashboard"]',
      '.main-content',
      '.app-content'
    ];
    
    const dashboardElement = await this.findBestSelector(dashboardElementSelectors, 'Dashboard Container');
    if (dashboardElement) dashboardSelectors.push(dashboardElement);

    // User profile/menu
    const profileSelectors = [
      '.user-menu',
      '.profile-dropdown',
      '[data-testid="user-menu"]',
      '.avatar',
      '.user-avatar'
    ];
    
    const profileElement = await this.findBestSelector(profileSelectors, 'User Profile');
    if (profileElement) dashboardSelectors.push(profileElement);

    // Navigation menu
    const navSelectors = [
      '.nav',
      '.navigation',
      '.sidebar',
      '[data-testid="navigation"]',
      '.main-nav'
    ];
    
    const navElement = await this.findBestSelector(navSelectors, 'Navigation Menu');
    if (navElement) dashboardSelectors.push(navElement);

    this.discoveredPages.push({
      pageName: 'DashboardPage',
      url: '/dashboard',
      selectors: dashboardSelectors
    });
  }

  async findBestSelector(selectors: string[], elementName: string): Promise<DiscoveredSelector | null> {
    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector);
        if (element) {
          const isVisible = await element.isVisible();
          const tagName = await element.evaluate(el => el.tagName.toLowerCase());
          const text = await element.textContent();
          
          console.log(`✅ Found ${elementName}: ${selector}`);
          
          return {
            name: elementName.replace(/\s+/g, ''),
            selector,
            fallbackSelectors: selectors.filter(s => s !== selector),
            elementType: tagName,
            isVisible,
            hasText: text?.trim() || undefined
          };
        }
      } catch (error) {
        continue;
      }
    }
    
    console.log(`❌ Could not find ${elementName}`);
    return null;
  }

  async generatePageObjects(): Promise<void> {
    for (const pageData of this.discoveredPages) {
      const pageObjectCode = this.generatePageObjectClass(pageData);
      const filename = `src/pages/${pageData.pageName}.ts`;
      
      await fs.promises.writeFile(filename, pageObjectCode);
      console.log(`📝 Generated Page Object: ${filename}`);
    }
  }

  generatePageObjectClass(pageData: PageObjectData): string {
    return `
import { Page, Locator } from '@playwright/test';

export class ${pageData.pageName} {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Navigation
  async navigate(): Promise<void> {
    await this.page.goto('${pageData.url}');
  }

  // Selectors with fallbacks
${pageData.selectors.map(selector => this.generateSelectorMethod(selector)).join('\n')}

  // Actions
${this.generateActionMethods(pageData)}
}`;
  }

  generateSelectorMethod(selector: DiscoveredSelector): string {
    return `
  get ${selector.name.toLowerCase()}(): Locator {
    // Primary selector: ${selector.selector}
    // Fallbacks: ${selector.fallbackSelectors.join(', ')}
    
    try {
      return this.page.locator('${selector.selector}');
    } catch {
      // Try fallback selectors
      ${selector.fallbackSelectors.map(fallback => 
        `try { return this.page.locator('${fallback}'); } catch {}`
      ).join('\n      ')}
      
      throw new Error('Could not find ${selector.name} element');
    }
  }`;
  }

  generateActionMethods(pageData: PageObjectData): string {
    if (pageData.pageName === 'LoginPage') {
      return `
  async login(email: string, password: string): Promise<void> {
    await this.emailinput.fill(email);
    await this.passwordinput.fill(password);
    await this.loginbutton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      return await this.errormessage.textContent();
    } catch {
      return null;
    }
  }`;
    }

    if (pageData.pageName === 'DashboardPage') {
      return `
  async waitForDashboard(): Promise<void> {
    await this.dashboardcontainer.waitFor({ state: 'visible' });
  }

  async getUserName(): Promise<string | null> {
    try {
      return await this.userprofile.textContent();
    } catch {
      return null;
    }
  }`;
    }

    return '';
  }

  async saveDiscoveredSelectors(): Promise<void> {
    const output = {
      discoveredAt: new Date().toISOString(),
      pages: this.discoveredPages
    };

    await fs.promises.writeFile(
      'discovered-selectors.json',
      JSON.stringify(output, null, 2)
    );
    
    console.log(`📊 Saved ${this.discoveredPages.length} page objects to discovered-selectors.json`);
  }

  async run(): Promise<void> {
    console.log('🚀 Starting AppRabbit UI Selector Discovery...\n');
    
    await this.initialize();
    
    try {
      await this.discoverLoginPage();
      await this.discoverDashboardPage();
      await this.generatePageObjects();
      await this.saveDiscoveredSelectors();
      
      console.log('\n UI Discovery complete!');
      console.log(`Generated ${this.discoveredPages.length} Page Objects`);
      console.log('Run "npm run test:ui" to test the discovered selectors');
      
    } finally {
      await this.browser.close();
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run discovery when script is executed directly
if (require.main === module) {
  new SelectorDiscovery().run().catch(console.error);
}
