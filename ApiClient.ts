import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export class ApiClient {
  private client: AxiosInstance;
  private authToken?: string;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.APPRABBIT_API_URL || 'https://api.apprabbit.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.log(`❌ API Error: ${error.response?.status} ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  clearAuthToken(): void {
    this.authToken = undefined;
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.client.post('/auth/login', credentials);
    
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    
    return this.formatResponse(response);
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.client.post('/auth/logout');
    this.clearAuthToken();
    return this.formatResponse(response);
  }

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<ApiResponse> {
    const response = await this.client.post('/auth/register', userData);
    return this.formatResponse(response);
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse> {
    const response = await this.client.get('/user/profile');
    return this.formatResponse(response);
  }

  async updateUserProfile(data: any): Promise<ApiResponse> {
    const response = await this.client.put('/user/profile', data);
    return this.formatResponse(response);
  }

  // App/Project endpoints
  async getApps(): Promise<ApiResponse> {
    const response = await this.client.get('/apps');
    return this.formatResponse(response);
  }

  async createApp(appData: any): Promise<ApiResponse> {
    const response = await this.client.post('/apps', appData);
    return this.formatResponse(response);
  }

  async getProjects(): Promise<ApiResponse> {
    const response = await this.client.get('/projects');
    return this.formatResponse(response);
  }

  // Generic methods for discovered endpoints
  async get(endpoint: string): Promise<ApiResponse> {
    const response = await this.client.get(endpoint);
    return this.formatResponse(response);
  }

  async post(endpoint: string, data: any): Promise<ApiResponse> {
    const response = await this.client.post(endpoint, data);
    return this.formatResponse(response);
  }

  async put(endpoint: string, data: any): Promise<ApiResponse> {
    const response = await this.client.put(endpoint, data);
    return this.formatResponse(response);
  }

  async delete(endpoint: string): Promise<ApiResponse> {
    const response = await this.client.delete(endpoint);
    return this.formatResponse(response);
  }

  private formatResponse<T>(response: AxiosResponse<T>): ApiResponse<T> {
    return {
      data: response.data,
      status: response.status,
      message: response.statusText,
    };
  }

  // Test helpers
  async isEndpointAvailable(endpoint: string, method: string = 'GET'): Promise<boolean> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        validateStatus: () => true // Don't throw for any status code
      });
      
      // Consider 2xx, 3xx, 401, and 403 as "available" (endpoint exists)
      return response.status < 500;
    } catch {
      return false;
    }
  }

  async testEndpoint(endpoint: string, method: string = 'GET', data?: any): Promise<{
    available: boolean;
    status?: number;
    error?: string;
  }> {
    try {
      const response = await this.client.request({
        method,
        url: endpoint,
        data,
        validateStatus: () => true
      });
      
      return {
        available: true,
        status: response.status
      };
    } catch (error: any) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}
