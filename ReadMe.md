AppRabbit Test Automation Framework

A comprehensive TypeScript-based test automation framework for AppRabbit applications, featuring API testing, UI automation, and intelligent discovery capabilities.

Show Image
Show Image
Show Image
Show Image

📋 Table of Contents

Features
Prerequisites
Installation
Quick Start
Configuration
Project Structure
Usage Examples
Discovery Features
Reporting
Available Scripts
Best Practices
Troubleshooting
Contributing
License


🚀 Features
Core Testing Capabilities

API Testing: Full-featured HTTP client with authentication, request/response validation, and comprehensive error handling
UI Testing: Playwright-based browser automation with robust, multi-strategy selector mechanisms
Cross-Platform Support: Seamless testing across multiple environments (development, staging, production)
TypeScript First: Complete type safety with IntelliSense support for enhanced developer experience

Advanced Features

Automatic Discovery

API endpoint discovery with automatic client generation
UI selector discovery with intelligent fallback mechanisms


Jira Integration: Automatic bug reporting for failed tests with screenshots and detailed context
Page Object Model: Maintainable UI test structure with enhanced selector resilience
Comprehensive Reporting: Generate HTML and JSON test reports with screenshots and detailed metrics
Test Data Management: Environment-specific test data with built-in validation


📦 Prerequisites
Before you begin, ensure you have the following installed:

Node.js 16 or higher
npm or yarn package manager
Chrome/Chromium browser (required for UI tests)


🔧 Installation
1. Clone the Repository
bashgit clone https://github.com/RemoteJava/apprabbit-testing-framework.git
cd apprabbit-testing-framework
2. Install Dependencies
bashnpm install
3. Install Playwright Browsers
bashnpx playwright install
4. Configure Environment Variables
bashcp .env.example .env
Edit the .env file with your specific configuration values (see Configuration section).

⚡ Quick Start
Run All Tests
bashnpm run test
Run Specific Test Suites
bash# API tests only
npm run test:api

# UI tests only
npm run test:ui
Generate Discovery Data
bash# Discover API endpoints
npm run discover:api

# Discover UI selectors
npm run discover:selectors

⚙️ Configuration
Environment Variables
Create a .env file in the project root with the following configuration:
env# AppRabbit Application URLs
APPRABBIT_BASE_URL=https://app.apprabbit.com
APPRABBIT_API_URL=https://api.apprabbit.com

# Test User Credentials
APPRABBIT_TEST_EMAIL=test@example.com
APPRABBIT_TEST_PASSWORD=password123

# Admin User Credentials
APPRABBIT_ADMIN_EMAIL=admin@example.com
APPRABBIT_ADMIN_PASSWORD=adminpass123

# Jira Integration (Optional)
JIRA_URL=https://your-company.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=your-jira-api-token
JIRA_PROJECT_KEY=ALT
CREATE_JIRA_TICKETS=false

# Environment
NODE_ENV=development
Test Data Configuration
The framework uses test-data.json for managing test data. Example structure:
json{
  "users": {
    "valid": [
      {
        "email": "test@example.com",
        "password": "password123",
        "role": "user",
        "profile": {
          "name": "Test User"
        }
      }
    ],
    "invalid": [
      {
        "email": "invalid@email.com",
        "password": "wrongpassword",
        "role": "user",
        "profile": {
          "name": "Invalid User"
        }
      }
    ]
  }
}

📁 Project Structure
apprabbit-testing-framework/
├── src/
│   ├── api/
│   │   ├── ApiClient.ts              # HTTP client with authentication
│   │   ├── JiraClient.ts             # Jira integration client
│   │   └── generated-client.ts       # Auto-generated API client
│   ├── pages/
│   │   ├── BasePage.ts               # Base page object class
│   │   ├── LoginPage.ts              # Login page object
│   │   └── DashboardPage.ts          # Dashboard page object
│   ├── tests/
│   │   ├── api/
│   │   │   └── demo-api.test.ts      # API test examples
│   │   └── ui/
│   │       └── demo-ui.test.ts       # UI test examples
│   ├── utils/
│   │   ├── TestDataManager.ts        # Test data management
│   │   ├── TestRunner.ts             # Enhanced test execution
│   │   ├── endpoint-discovery.ts     # API endpoint discovery
│   │   └── selector-discovery.ts     # UI selector discovery
│   └── types/                        # TypeScript type definitions
├── reports/                          # Generated test reports
├── test-data.json                    # Test data configuration
├── playwright.config.ts              # Playwright configuration
├── jest.config.js                    # Jest configuration
└── package.json                      # Project dependencies

💡 Usage Examples
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

🔍 Discovery Features
API Endpoint Discovery
Automatically discover and document API endpoints:
bashnpm run discover:api
Generated outputs:

discovered-endpoints.json - List of discovered endpoints with metadata
src/api/generated-client.ts - Auto-generated TypeScript API client

UI Selector Discovery
Automatically discover UI selectors with fallback strategies:
bashnpm run discover:selectors
Generated outputs:

discovered-selectors.json - Found selectors with metadata and alternatives
Updated page object classes with resilient selector strategies


📊 Reporting
HTML Reports
Visual, interactive test reports featuring:

Pass/fail status with color-coded results
Screenshots for failed UI tests
Duration and environment information
Located in reports/html/test-report.html

Open the report:
bashnpm run report:open
JSON Reports
Machine-readable test results for:

CI/CD pipeline integration
Custom reporting tools
Located in reports/test-report.json

Jira Integration
Automatic bug reporting includes:

Test failure details
Execution summaries
Screenshots attached to bug reports
Configurable via .env file


🛠️ Available Scripts
Testing
bashnpm run test              # Run all tests
npm run test:api          # Run API tests only
npm run test:ui           # Run UI tests only
npm run test:watch        # Run tests in watch mode
Discovery
bashnpm run discover:api      # Discover API endpoints
npm run discover:selectors # Discover UI selectors
Reporting
bashnpm run report:generate   # Generate test reports
npm run report:open       # Open HTML report in browser
Development
bashnpm run lint              # Run ESLint
npm run type-check        # Run TypeScript type checking
npm run clean             # Clean build artifacts

✅ Best Practices
API Testing

Use environment variables for all credentials and URLs
Implement proper error handling for network failures
Validate response schemas and HTTP status codes
Always clean up test data after execution

UI Testing

Utilize the Page Object Model for maintainable test architecture
Implement multiple selector strategies for enhanced resilience
Capture screenshots on test failures for debugging
Use explicit waits instead of fixed setTimeout() delays

Test Data Management

Maintain separate test data for different environments
Implement automated data cleanup after test execution
Avoid hardcoding test data directly in test files
Use data factories for generating dynamic test data


🐛 Troubleshooting
API Tests Failing
Possible causes and solutions:

Environment variables not set

Verify all required variables are present in .env
Check for typos in variable names


Network connectivity issues

Confirm you can reach the API endpoints
Check for firewall or VPN restrictions


Invalid credentials

Verify test user accounts are active
Ensure passwords haven't expired



UI Tests Failing
Possible causes and solutions:

Outdated selectors

Run selector discovery to find updated elements
Update page object classes with new selectors


UI changes in application

Review recent application deployments
Update page object models to match new UI structure


Browser compatibility

Ensure Playwright browsers are up to date: npx playwright install
Check browser version requirements



Jira Integration Issues
Possible causes and solutions:

Permission errors

Verify Jira API token has correct permissions
Ensure user has rights to create issues


Configuration errors

Double-check project key and issue type configurations
Validate Jira URL format


Network access

Confirm network access to Jira instance
Check for corporate proxy settings



Enable Debug Mode
For detailed logging output:
bashDEBUG=true npm run test

🤝 Contributing
We welcome contributions! Please follow these steps:
1. Fork the Repository
Click the "Fork" button at the top right of the repository page.
2. Create a Feature Branch
bashgit checkout -b feature/your-feature-name
3. Make Your Changes

Write clean, well-documented code
Add tests for new functionality
Update documentation as needed

4. Run the Test Suite
bashnpm run test
npm run lint
npm run type-check
5. Commit Your Changes
bashgit commit -m "Add: brief description of your changes"
6. Push to Your Fork
bashgit push origin feature/your-feature-name
7. Submit a Pull Request
Open a pull request from your fork to the main repository.
Code Standards

Use TypeScript for all new code
Follow existing naming conventions
Add JSDoc comments for public methods and classes
Write comprehensive tests for new functionality
Keep code DRY (Don't Repeat Yourself)
Update documentation to reflect changes


📄 License
This project is licensed under the MIT License. See the LICENSE file for full details.

💬 Support
Need help? Here's how to get support:

Issues: Create an issue on GitHub
Documentation: Review this README and inline code documentation
Troubleshooting: Check the Troubleshooting section above


📝 Changelog
Version 1.0.0 (Initial Release)
Features:

✅ API and UI testing capabilities
✅ Automatic endpoint and selector discovery
✅ Jira integration for bug reporting
✅ Comprehensive HTML and JSON reporting
✅ Page Object Model implementation
✅ TypeScript support with full type safety
✅ Environment-based configuration
✅ Test data management system


🙏 Acknowledgments
Built with:

Playwright - Browser automation
Jest - Testing framework
TypeScript - Type safety


Made with ❤️ by the AppRabbit Testing Team
