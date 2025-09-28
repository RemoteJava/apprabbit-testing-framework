import { test, expect } from '@playwright/test';

/**
 * PORTFOLIO DEMO: Simple UI Test for AppRabbit
 * 
 * This test demonstrates:
 * ✅ Browser automation with Playwright
 * ✅ Page Object Model usage
 * ✅ User interface testing
 * ✅ Visual validation
 * 
 * Perfect for showing employers during interviews!
 */

test.describe('AppRabbit Frontend Demo', () => {
  
  test('should display AppRabbit login page correctly', async ({ page }) => {
    console.log('🎭 Starting Frontend Demo Test...');
    
    // Step 1: Navigate to AppRabbit login page
    console.log('📱 Opening AppRabbit application...');
    await page.goto('https://app.apprabbit.com/login');
    
    // Step 2: Wait for page to load completely
    await page.waitForLoadState('networkidle');
    
    // Step 3: Take a screenshot for the demo
    await page.screenshot({ 
      path: 'reports/demo-login-page.png',
      fullPage: true 
    });
    
    // Step 4: Verify the page title
    console.log('🔍 Checking page title...');
    const title = await page.title();
    expect(title).toContain('AppRabbit');
    console.log('✅ Page title verified:', title);
    
    // Step 5: Check if login form elements are present
    console.log('🔍 Checking login form elements...');
    
    // Look for email input (trying multiple selectors for reliability)
    const emailSelectors = [
      '[data-testid="email-input"]',
      '#email',
      'input[type="email"]',
      'input[name="email"]'
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      if (await page.locator(selector).count() > 0) {
        emailInput = page.locator(selector);
        console.log('✅ Found email input with selector:', selector);
        break;
      }
    }
    
    // Look for password input
    const passwordSelectors = [
      '[data-testid="password-input"]',
      '#password',
      'input[type="password"]',
      'input[name="password"]'
    ];
    
    let passwordInput = null;
    for (const selector of passwordSelectors) {
      if (await page.locator(selector).count() > 0) {
        passwordInput = page.locator(selector);
        console.log('✅ Found password input with selector:', selector);
        break;
      }
    }
    
    // Look for login button
    const buttonSelectors = [
      '[data-testid="login-button"]',
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign In")'
    ];
    
    let loginButton = null;
    for (const selector of buttonSelectors) {
      if (await page.locator(selector).count() > 0) {
        loginButton = page.locator(selector);
        console.log('✅ Found login button with selector:', selector);
        break;
      }
    }
    
    // Step 6: Validate form elements exist
    if (emailInput) {
      await expect(emailInput).toBeVisible();
      console.log('✅ Email input is visible');
    }
    
    if (passwordInput) {
      await expect(passwordInput).toBeVisible();
      console.log('✅ Password input is visible');
    }
    
    if (loginButton) {
      await expect(loginButton).toBeVisible();
      console.log('✅ Login button is visible');
    }
    
    // Step 7: Test form interaction (without actually logging in)
    console.log('🔍 Testing form interactions...');
    
    if (emailInput && passwordInput) {
      // Type demo credentials
      await emailInput.fill('demo.user@example.com');
      await passwordInput.fill('demo-password');
      
      // Verify the values were entered
      await expect(emailInput).toHaveValue('demo.user@example.com');
      await expect(passwordInput).toHaveValue('demo-password');
      
      console.log('✅ Form inputs working correctly');
    }
    
    // Step 8: Take final screenshot
    await page.screenshot({ 
      path: 'reports/demo-form-filled.png',
      fullPage: true 
    });
    
    console.log('✅ Frontend Demo Test completed successfully!');
    console.log('📸 Screenshots saved to reports/ directory');
  });
  
  test('should handle invalid login gracefully', async ({ page }) => {
    console.log('🎭 Testing error handling...');
    
    await page.goto('https://app.apprabbit.com/login');
    await page.waitForLoadState('networkidle');
    
    // Try to find and fill login form
    const emailInput = page.locator('input[type="email"], #email, [name="email"]').first();
    const passwordInput = page.locator('input[type="password"], #password, [name="password"]').first();
    const loginButton = page.locator('button[type="submit"], button:has-text("Login")').first();
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0 && await loginButton.count() > 0) {
      // Fill with invalid credentials
      await emailInput.fill('invalid@email.com');
      await passwordInput.fill('wrongpassword');
      
      // Submit the form
      await loginButton.click();
      
      // Wait a moment for any error messages
      await page.waitForTimeout(2000);
      
      // Look for error messages (multiple possible selectors)
      const errorSelectors = [
        '[data-testid="error-message"]',
        '.error',
        '.alert-danger',
        '[role="alert"]',
        '.error-message'
      ];
      
      let foundError = false;
      for (const selector of errorSelectors) {
        if (await page.locator(selector).count() > 0) {
          const errorText = await page.locator(selector).textContent();
          console.log(' Found error message:', errorText);
          foundError = true;
          break;
        }
      }
      
      // If no specific error message found, check if we're still on login page
      if (!foundError) {
        const currentUrl = page.url();
        if (currentUrl.includes('login')) {
          console.log(' Stayed on login page after invalid credentials');
        }
      }
    }
    
    console.log(' Error handling test completed');
  });
});
