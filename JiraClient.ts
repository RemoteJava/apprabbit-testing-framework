import JiraApi from 'jira-client';
import dotenv from 'dotenv';

dotenv.config();

export interface JiraIssue {
  key: string;
  summary: string;
  description: string;
  issueType: string;
  priority: string;
  labels: string[];
  components?: string[];
}

export interface TestFailure {
  testName: string;
  testFile: string;
  error: string;
  stackTrace?: string;
  screenshot?: string;
  duration: number;
  timestamp: Date;
}

export class JiraClient {
  private jira: JiraApi;
  private projectKey: string;

  constructor() {
    this.jira = new JiraApi({
      protocol: 'https',
      host: process.env.JIRA_URL?.replace('https://', '') || '',
      username: process.env.JIRA_EMAIL || '',
      password: process.env.JIRA_API_TOKEN || '',
      apiVersion: '2',
      strictSSL: true
    });

    this.projectKey = process.env.JIRA_PROJECT_KEY || 'ALT';
  }

  async createBugFromTestFailure(failure: TestFailure): Promise<string> {
    const issue: any = {
      fields: {
        project: { key: this.projectKey },
        summary: `Test Failure: ${failure.testName}`,
        description: this.formatTestFailureDescription(failure),
        issuetype: { name: 'Bug' },
        priority: { name: this.determinePriority(failure) },
        labels: this.generateLabels(failure),
        components: this.determineComponents(failure),
      }
    };

    const createdIssue = await this.jira.addNewIssue(issue);
    
    // Attach screenshot if available
    if (failure.screenshot) {
      await this.attachScreenshot(createdIssue.key, failure.screenshot);
    }

    console.log(`🐛 Created Jira bug: ${createdIssue.key}`);
    return createdIssue.key;
  }

  private formatTestFailureDescription(failure: TestFailure): string {
    return `
## Test Failure Report

**Test Name:** ${failure.testName}
**Test File:** ${failure.testFile}
**Timestamp:** ${failure.timestamp.toISOString()}
**Duration:** ${failure.duration}ms

## Error Details
\`\`\`
${failure.error}
\`\`\`

${failure.stackTrace ? `## Stack Trace\n\`\`\`\n${failure.stackTrace}\n\`\`\`` : ''}

## Environment
- Test Type: ${failure.testFile.includes('api') ? 'API' : 'UI'}
- Browser: ${failure.testFile.includes('ui') ? 'Chrome' : 'N/A'}
- Base URL: ${process.env.APPRABBIT_BASE_URL}

## Reproduction Steps
1. Run the failing test: \`npm test ${failure.testFile}\`
2. Check the error details above
3. Review any attached screenshots

## Additional Context
This bug was automatically created from a failed automated test.
`;
  }

  private determinePriority(failure: TestFailure): string {
    // Login/auth failures are high priority
    if (failure.testName.toLowerCase().includes('login') || 
        failure.testName.toLowerCase().includes('auth')) {
      return 'High';
    }

    // API failures are medium priority
    if (failure.testFile.includes('api')) {
      return 'Medium';
    }

    // UI failures are medium priority
    return 'Medium';
  }

  private generateLabels(failure: TestFailure): string[] {
    const labels = ['automated-test', 'test-failure'];

    if (failure.testFile.includes('api')) {
      labels.push('api-test');
    }

    if (failure.testFile.includes('ui')) {
      labels.push('ui-test');
    }

    if (failure.testName.toLowerCase().includes('login')) {
      labels.push('login');
    }

    return labels;
  }

  private determineComponents(failure: TestFailure): any[] {
    const components = [];

    if (failure.testName.toLowerCase().includes('login')) {
      components.push({ name: 'Authentication' });
    }

    if (failure.testFile.includes('api')) {
      components.push({ name: 'API' });
    }

    if (failure.testFile.includes('ui')) {
      components.push({ name: 'UI' });
    }

    return components;
  }

  private async attachScreenshot(issueKey: string, screenshotPath: string): Promise<void> {
    try {
      await this.jira.addAttachmentOnIssue(issueKey, screenshotPath);
      console.log(`📎 Attached screenshot to ${issueKey}`);
    } catch (error) {
      console.error(`Failed to attach screenshot to ${issueKey}:`, error);
    }
  }

  async createTestExecutionIssue(testResults: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    duration: number;
  }): Promise<string> {
    const issue: any = {
      fields: {
        project: { key: this.projectKey },
        summary: `Test Execution Report - ${new Date().toLocaleDateString()}`,
        description: `
## Test Execution Summary

**Total Tests:** ${testResults.totalTests}
**Passed:** ${testResults.passedTests}
**Failed:** ${testResults.failedTests}
**Success Rate:** ${Math.round((testResults.passedTests / testResults.totalTests) * 100)}%
**Duration:** ${testResults.duration}ms

**Execution Date:** ${new Date().toISOString()}
        `,
        issuetype: { name: 'Task' },
        labels: ['test-execution', 'automated']
      }
    };

    const createdIssue = await this.jira.addNewIssue(issue);
    console.log(`📊 Created test execution report: ${createdIssue.key}`);
    return createdIssue.key;
  }

  async linkTestFailureToBug(testFailureKey: string, bugKey: string): Promise<void> {
    await this.jira.createIssueLink({
      type: { name: 'Relates' },
      inwardIssue: { key: testFailureKey },
      outwardIssue: { key: bugKey }
    });
  }

  async updateTestCase(testCaseKey: string, status: 'PASS' | 'FAIL', details?: string): Promise<void> {
    const transition = status === 'PASS' ? 'Passed' : 'Failed';
    
    try {
      await this.jira.transitionIssue(testCaseKey, {
        transition: { name: transition },
        update: {
          comment: [{
            add: {
              body: details || `Test ${status.toLowerCase()}ed at ${new Date().toISOString()}`
            }
          }]
        }
      });
    } catch (error) {
      console.error(`Failed to update test case ${testCaseKey}:`, error);
    }
  }
}
