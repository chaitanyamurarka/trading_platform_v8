/**
 * @file api/index.js
 * @description Main API module that exports all API functionality
 */

// Export all services
export * from './services/index.js';

// Export client utilities
export { ApiError, get, post, put, del } from './client.js';

// Export endpoint definitions and helpers
export { API_ENDPOINTS, buildUrl, getDataEndpoint, getWebSocketUrl } from './endpoints.js';

// Re-export for convenience
export { WS_STATES } from './services/websocket.service.js';