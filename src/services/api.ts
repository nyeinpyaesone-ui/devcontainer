// API Service Layer - Handles all HTTP requests with authentication

import { ENV, API_ENDPOINTS, buildApiUrl } from '../config/env';
import type { ApiResponse } from '../types/auth';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = ENV.API_BASE_URL;
    this.timeout = ENV.API_TIMEOUT;
  }

  // Get authentication token from localStorage
  private getAuthToken(): string | null {
    return localStorage.getItem(ENV.AUTH_TOKEN_KEY);
  }

  // Get refresh token from localStorage
  private getRefreshToken(): string | null {
    return localStorage.getItem(ENV.AUTH_REFRESH_TOKEN_KEY);
  }

  // Set authentication tokens
  setAuthTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ENV.AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(ENV.AUTH_REFRESH_TOKEN_KEY, refreshToken);
  }

  // Clear authentication tokens
  clearAuthTokens(): void {
    localStorage.removeItem(ENV.AUTH_TOKEN_KEY);
    localStorage.removeItem(ENV.AUTH_REFRESH_TOKEN_KEY);
    localStorage.removeItem(ENV.AUTH_USER_KEY);
  }

  // Build headers with authentication
  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic request handler
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = buildApiUrl(endpoint);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Network error');
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = params ? buildApiUrl(endpoint, params) : buildApiUrl(endpoint);
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication Methods
  async login(email: string, password: string) {
    return this.post<{ user: any; tokens: any }>(API_ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    });
  }

  async register(email: string, username: string, password: string, displayName?: string) {
    return this.post<{ user: any; message: string }>(API_ENDPOINTS.AUTH.REGISTER, {
      email,
      username,
      password,
      displayName,
    });
  }

  async logout() {
    return this.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async refresh() {
    const refreshToken = this.getRefreshToken();
    return this.post<{ tokens: any }>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken,
    });
  }

  async verify() {
    return this.get<{ user: any }>(API_ENDPOINTS.AUTH.VERIFY);
  }

  // Configuration Methods
  async getConfigurations() {
    return this.get<any[]>(API_ENDPOINTS.CONFIGURATIONS.LIST);
  }

  async createConfiguration(config: any) {
    return this.post<any>(API_ENDPOINTS.CONFIGURATIONS.CREATE, config);
  }

  async updateConfiguration(id: string, config: any) {
    return this.put<any>(`${API_ENDPOINTS.CONFIGURATIONS.BASE}/${id}`, config);
  }

  async deleteConfiguration(id: string) {
    return this.delete(`${API_ENDPOINTS.CONFIGURATIONS.BASE}/${id}`);
  }

  async generateArtifacts(config: any) {
    return this.post<any>(API_ENDPOINTS.CONFIGURATIONS.GENERATE, config);
  }

  // Template Methods
  async getTemplates() {
    return this.get<any[]>(API_ENDPOINTS.TEMPLATES.LIST);
  }

  async createTemplate(template: any) {
    return this.post<any>(API_ENDPOINTS.TEMPLATES.CREATE, template);
  }

  // Analytics Methods
  async getMetrics() {
    return this.get<any>(API_ENDPOINTS.ANALYTICS.METRICS);
  }

  async getTrends() {
    return this.get<any>(API_ENDPOINTS.ANALYTICS.TRENDS);
  }

  // Collaboration Methods
  async getSessions() {
    return this.get<any[]>(API_ENDPOINTS.COLLABORATION.SESSIONS);
  }

  async createSession(session: any) {
    return this.post<any>(API_ENDPOINTS.COLLABORATION.SESSIONS, session);
  }

  // Version Control Methods
  async getCommits() {
    return this.get<any[]>(API_ENDPOINTS.VERSION_CONTROL.COMMITS);
  }

  async createCommit(commit: any) {
    return this.post<any>(API_ENDPOINTS.VERSION_CONTROL.COMMITS, commit);
  }

  // Compliance Methods
  async getComplianceReports() {
    return this.get<any[]>(API_ENDPOINTS.COMPLIANCE.REPORTS);
  }

  async generateComplianceReport(framework: string, config: any) {
    return this.post<any>(API_ENDPOINTS.COMPLIANCE.REPORTS, { framework, config });
  }

  // Performance Methods
  async getPerformanceMetrics() {
    return this.get<any>(API_ENDPOINTS.PERFORMANCE.METRICS);
  }

  async runPerformanceProfiler(config: any) {
    return this.post<any>(API_ENDPOINTS.PERFORMANCE.PROFILER, config);
  }
}

// Export singleton instance
export const apiService = new ApiService();
