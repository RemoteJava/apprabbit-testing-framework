import axios from 'axios';
import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import dotenv from 'dotenv';

dotenv.config();

interface DiscoveredEndpoint {
  method: string;
  url: string;
  description: string;
  parameters?: string[];
  authRequired: boolean;
}

class EndpointDiscovery {
  private baseUrl: string;
  private discoveredEndpoints: DiscoveredEndpoint[] = [];

  constructor() {
    this.baseUrl = process.env.APPRABBIT_API_URL || 'https://api.apprabbit.com';
  }

  async discoverFromNetworkRequests(): Promise<void> {
    console.log('🔍 Discovering API endpoints from network requests...');
    
    // Common AppRabbit endpoints to test
    const commonPaths = [
      '/auth/login',
      '/auth/logout', 
      '/auth/register',
      '/auth/forgot-password',
      '/user/profile',
      '/user/settings',
      '/apps',
      '/apps/:id',
      '/projects',
      '/projects/:id',
      '/api/v1/users',
      '/api/v1/auth',
      '/api/v1/projects'
    ];

    for (const path of commonPaths) {
      await this.testEndpoint('GET', path);
      await this.testEndpoint('POST', path);
    }
  }

  async testEndpoint(method: string, path: string): Promise<void> {
    try {
      const url = `${this.baseUrl}${path}`;
      const response = await axios({
        method,
        url,
        timeout: 5000,
        validateStatus: () => true // Accept all status codes
      });

      const endpoint: DiscoveredEndpoint = {
        method,
        url: path,
        description: this.getEndpointDescription(path),
        authRequired: response.status === 401,
      };

      this.discoveredEndpoints.push(endpoint);
      
      console.log(`✅ Found: ${method} ${path} (${response.status})`);
    } catch (error) {
      console.log(`❌ Failed: ${method} ${path}`);
    }
  }

  getEndpointDescription(path: string): string {
    const descriptions: { [key: string]: string } = {
      '/auth/login': 'Authenticate user with email/password',
      '/auth/logout': 'Logout current user session',
      '/auth/register': 'Register new user account',
      '/user/profile': 'Get/Update user profile information',
      '/apps': 'List user applications',
      '/projects': 'List user projects'
    };
    
    return descriptions[path] || 'Unknown endpoint function';
  }

  async generateApiClient(): Promise<void> {
    const apiClientCode = `
// Auto-generated API client based on discovered endpoints
export class AppRabbitApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl: string = '${this.baseUrl}') {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

${this.discoveredEndpoints.map(endpoint => this.generateMethodForEndpoint(endpoint)).join('\n')}
}`;

    await fs.promises.writeFile('src/api/generated-client.ts', apiClientCode);
    console.log('📝 Generated API client: src/api/generated-client.ts');
  }

  generateMethodForEndpoint(endpoint: DiscoveredEndpoint): string {
    const methodName = this.pathToMethodName(endpoint.url);
    const hasParams = endpoint.url.includes(':');
    
    return `
  async ${methodName}(${hasParams ? 'params: any, ' : ''}data?: any): Promise<any> {
    const url = \`\${this.baseUrl}${endpoint.url.replace(/:(\w+)/g, '${$1}')}\`;
    const headers: any = { 'Content-Type': 'application/json' };
    
    ${endpoint.authRequired ? 'if (this.authToken) headers.Authorization = `Bearer ${this.authToken}`;' : ''}
    
    const response = await fetch(url, {
      method: '${endpoint.method}',
      headers,
      ${endpoint.method !== 'GET' ? 'body: data ? JSON.stringify(data) : undefined' : ''}
    });
    
    return response.json();
  }`;
  }

  pathToMethodName(path: string): string {
    return path
      .replace(/\/api\/v\d+\//, '') // Remove API version
      .replace(/[\/:-]/g, '_')       // Replace special chars
      .replace(/_+/g, '_')           // Clean multiple underscores
      .replace(/^_|_$/g, '')         // Remove leading/trailing underscores
      .toLowerCase();
  }

  async saveDiscoveredEndpoints(): Promise<void> {
    const output = {
      discoveredAt: new Date().toISOString(),
      baseUrl: this.baseUrl,
      endpoints: this.discoveredEndpoints
    };

    await fs.promises.writeFile(
      'discovered-endpoints.json', 
      JSON.stringify(output, null, 2)
    );
    
    console.log(`📊 Saved ${this.discoveredEndpoints.length} endpoints to discovered-endpoints.json`);
  }

  async run(): Promise<void> {
    console.log('🚀 Starting AppRabbit API Discovery...\n');
    
    await this.discoverFromNetworkRequests();
    await this.generateApiClient();
    await this.saveDiscoveredEndpoints();
    
    console.log('\n✅ Discovery complete!');
    console.log(`Found ${this.discoveredEndpoints.length} endpoints`);
    console.log('Run "npm run test:api" to test the discovered endpoints');
  }
}

// Run discovery when script is executed directly
if (require.main === module) {
  new EndpointDiscovery().run().catch(console.error);
}
