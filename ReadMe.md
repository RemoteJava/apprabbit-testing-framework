AppRabbit Test Automation Framework
A comprehensive TypeScript-based test automation framework for AppRabbit applications, featuring API testing, UI automation, and intelligent discovery capabilities.
Features
Core Testing Capabilities

API Testing: HTTP client with authentication, request/response validation, and error handling
UI Testing: Playwright-based browser automation with robust selector strategies
Cross-Platform: Supports multiple environments (development, staging, production)
TypeScript: Full type safety and IntelliSense support

Advanced Features

Automatic Discovery:

API endpoint discovery and client generation
UI selector discovery with fallback mechanisms


Jira Integration: Automatic bug reporting for test failures
Page Object Model: Maintainable UI test structure with enhanced selector resilience
Comprehensive Reporting: HTML and JSON test reports with screenshots
Test Data Management: Environment-specific test data with validation

Quick Start
Prerequisites

Node.js 16+
npm or yarn
Chrome/Chromium browser (for UI tests)

Installation

Clone the repository:

bashgit clone <repository-url>
cd apprabbit-test-framework

Install dependencies:

bashnpm install

Install Playwright browsers:

bashnpx playwright install

Set up environment variables:

bashcp .env.example .env
# Edit .env with your configuration
Basic Usage
Run all tests:
bashnpm run test
Run specific test suites:
bashnpm run test:api    # API tests only
npm run test:ui     # UI tests only
Generate discovery data:
bashnpm run discover:api        # Discover API endpoints
npm run discover:selectors  # Discover UI selectors
Configuration
Environment Variables
Create a .env file in the project root:
env# AppRabbit Configuration
APPRABBIT_BASE_URL=https://app.apprabbit.com
APPRABBIT_API_URL=https://api.apprabbit.com

# Test Credentials
APPRABBIT_TEST_EMAIL=test@example.com
APPRABBIT_TEST_PASSWORD=password123
APPRABBIT_ADMIN_EMAIL=admin@example.com
APPRABBIT_ADMIN_PASSWORD=adminpass123

# Jira Integration (Optional)
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=ALT
CREATE_JIRA_TICKETS=false

# Test Configuration
NODE_ENV=development
Test Data Configuration
The framework uses test-data.json for managing test data:
json{
  "users": {
    "valid": [
      {
        "email": "test@example.com",
        "password": "password123",
        "role": "user",
        "profile": { "name": "Test User" }
      }
    ],
    "invalid": [
      {
        "email": "invalid@email.com",
        "password": "wrongpassword",
        "role": "user",
        "profile": { "name": "Invalid User" }
      }
    ]
  }
}
Project Structure
├── src/
│   ├── api/
│   │   ├── ApiClient.ts           # HTTP client with auth
│   │   ├── JiraClient.ts          # Jira integration
│   │   └── generated-client.ts    # Auto-generated API client
│   ├── pages/
│   │   ├── BasePage.ts            # Base page object
│   │   ├── LoginPage.ts           # Login page object
│   │   └── DashboardPage.ts       # Dashboard page object
│   ├── tests/
│   │   ├── api/
│   │   │   └── demo-api.test.ts   # API test examples
│   │   └── ui/
│   │       └── demo-ui.test.ts    # UI test examples
│   ├── utils/
│   │   ├── TestDataManager.ts     # Test data management
│   │   ├── TestRunner.ts          # Enhanced test execution
│   │   ├── endpoint-discovery.ts  # API discovery
│   │   └── selector-discovery.ts  # UI discovery
│   └── types/
├── reports/                       # Test reports and artifacts
├── test-data.json                # Test data configuration
├── playwright.config.ts          # Playwright configuration
├── jest.config.js                # Jest configuration
└── package.json
Usage Examples
API Testing
typescriptimport { ApiClient } from '../api/ApiClient';

const apiClient = new ApiClient();

// Test authentication
const loginResponse = await apiClient.login({
  email: 'test@example.com',
  password: 'password123'
});

// Test authenticated endpoints
const userProfile = await apiClient.getUserProfile();
UI Testing
typescriptimport { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('user can login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  await loginPage.navigate();
  await loginPage.login('test@example.com', 'password123');
  await loginPage.expectRedirectAfterLogin('/dashboard');
});
Test Data Management
typescriptimport { TestDataManager } from '../utils/TestDataManager';

const testData = new TestDataManager();

// Get test users
const validUser = testData.getValidUser('admin');
const invalidUser = testData.getInvalidUser();

// Generate dynamic data
const randomUser = testData.generateRandomUser();
Discovery Features
API Endpoint Discovery
The framework can automatically discover API endpoints:
bashnpm run discover:api
This generates:

discovered-endpoints.json: List of found endpoints
src/api/generated-client.ts: Auto-generated API client

UI Selector Discovery
Automatically discover UI selectors with fallbacks:
bashnpm run discover:selectors
This generates:

discovered-selectors.json: Found selectors with metadata
Page object classes with resilient selector strategies

Reporting
HTML Reports

Visual test reports with pass/fail status
Screenshots for failed UI tests
Duration and environment information
Located in reports/html/test-report.html

JSON Reports

Machine-readable test results
Integration with CI/CD pipelines
Located in reports/test-report.json

Jira Integration

Automatic bug creation for test failures
Test execution summaries
Screenshots attached to bug reports

Available Scripts
bash# Testing
npm run test              # Run all tests
npm run test:api          # Run API tests only
npm run test:ui           # Run UI tests only
npm run test:watch        # Run tests in watch mode

# Discovery
npm run discover:api      # Discover API endpoints
npm run discover:selectors # Discover UI selectors

# Reporting
npm run report:generate   # Generate test reports
npm run report:open       # Open HTML report

# Utilities
npm run lint              # Run ESLint
npm run type-check        # Run TypeScript compilation
npm run clean             # Clean build artifacts
Best Practices
API Testing

Use environment variables for credentials and URLs
Implement proper error handling for network failures
Validate response schemas and status codes
Clean up test data after execution

UI Testing

Use Page Object Model for maintainable tests
Implement multiple selector strategies for resilience
Take screenshots on failures for debugging
Use explicit waits instead of fixed delays

Test Data

Use separate test data for different environments
Implement data cleanup after test execution
Avoid hardcoded test data in test files
Use factories for generating dynamic test data

Troubleshooting
Common Issues
API Tests Failing

Verify environment variables are set correctly
Check network connectivity to API endpoints
Ensure test credentials are valid

UI Tests Failing

Update selectors if application UI has changed
Run selector discovery to find new elements
Check browser compatibility and versions

Jira Integration Issues

Verify Jira API token has correct permissions
Check project key and issue type configurations
Ensure network access to Jira instance

Debug Mode
Enable debug logging:
bashDEBUG=true npm run test
Contributing

Fork the repository
Create a feature branch: git checkout -b feature-name
Make your changes and add tests
Run the test suite: npm run test
Commit your changes: git commit -m 'Add feature'
Push to the branch: git push origin feature-name
Submit a pull request

Code Standards

Use TypeScript for all new code
Follow existing naming conventions
Add JSDoc comments for public methods
Write tests for new functionality
Update documentation as needed

License
This project is licensed under the MIT License - see the LICENSE file for details.
Support
For issues and questions:

Create an issue in the GitHub repository
Check existing documentation and examples
Review troubleshooting section above

Changelog
Version 1.0.0

Initial release with API and UI testing capabilities
Automatic discovery features
Jira integration
Comprehensive reporting
Page Object Model implementation
