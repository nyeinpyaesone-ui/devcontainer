// Environment configuration with type safety
export const ENV = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  API_VERSION: import.meta.env.VITE_API_VERSION || 'v1',
  
  // Authentication
  AUTH_TOKEN_KEY: 'devcontainer_auth_token',
  AUTH_REFRESH_TOKEN_KEY: 'devcontainer_refresh_token',
  AUTH_USER_KEY: 'devcontainer_user',
  
  // GitHub Container Registry
  GHCR_REGISTRY: import.meta.env.VITE_GHCR_REGISTRY || 'ghcr.io',
  GHCR_NAMESPACE: import.meta.env.VITE_GHCR_NAMESPACE || 'nyeinpyaesone-ui',
  GHCR_TOKEN: import.meta.env.VITE_GHCR_TOKEN || '',
  
  // Application
  APP_NAME: 'GHCR Devcontainer Forge',
  APP_VERSION: '2.9.0',
  APP_ENV: import.meta.env.MODE || 'development',
  
  // Feature Flags
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_COLLABORATION: import.meta.env.VITE_ENABLE_COLLABORATION === 'true',
  
  // Timeouts
  API_TIMEOUT: 30000,
  AUTH_TOKEN_EXPIRY: 86400000, // 24 hours in milliseconds
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // User Management
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    DELETE: '/users/delete',
  },
  
  // Devcontainer Configurations
  CONFIGURATIONS: {
    BASE: '/configurations',
    LIST: '/configurations/list',
    CREATE: '/configurations/create',
    UPDATE: '/configurations/update',
    DELETE: '/configurations/delete',
    GENERATE: '/configurations/generate',
    EXPORT: '/configurations/export',
  },
  
  // Templates
  TEMPLATES: {
    BASE: '/templates',
    LIST: '/templates/list',
    CREATE: '/templates/create',
    UPDATE: '/templates/update',
    DELETE: '/templates/delete',
  },
  
  // Analytics
  ANALYTICS: {
    BASE: '/analytics',
    METRICS: '/analytics/metrics',
    TRENDS: '/analytics/trends',
    REPORTS: '/analytics/reports',
  },
  
  // Collaboration
  COLLABORATION: {
    BASE: '/collaboration',
    SESSIONS: '/collaboration/sessions',
    ACTIVITY: '/collaboration/activity',
    COMMENTS: '/collaboration/comments',
  },
  
  // Version Control
  VERSION_CONTROL: {
    BASE: '/version-control',
    COMMITS: '/version-control/commits',
    BRANCHES: '/version-control/branches',
    TAGS: '/version-control/tags',
  },
  
  // Compliance
  COMPLIANCE: {
    BASE: '/compliance',
    REPORTS: '/compliance/reports',
    FRAMEWORKS: '/compliance/frameworks',
    CHECKS: '/compliance/checks',
  },
  
  // Performance
  PERFORMANCE: {
    BASE: '/performance',
    PROFILER: '/performance/profiler',
    METRICS: '/performance/metrics',
  },
} as const;

// Helper function to build full API URL
export function buildApiUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${ENV.API_BASE_URL}/${ENV.API_VERSION}${endpoint}`;
  
  if (params) {
    const queryString = new URLSearchParams(params).toString();
    url += `?${queryString}`;
  }
  
  return url;
}

// Helper function to get GHCR image reference
export function getGHCRImageRef(repo: string, tag: string = 'latest'): string {
  return `${ENV.GHCR_REGISTRY}/${ENV.GHCR_NAMESPACE}/${repo.toLowerCase()}:${tag}`;
}
