/**
 * @file api/endpoints.js
 * @description Centralized API endpoint definitions
 * This file contains all API endpoint URLs and will make it easier
 * to migrate away from the "fake" routes when backend is refactored
 */

const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

/**
 * API Endpoints organized by feature/domain
 */
export const API_ENDPOINTS = {
    // Session Management
    SESSION: {
        INITIATE: `${API_BASE_URL}/utils/session/initiate`,
        HEARTBEAT: `${API_BASE_URL}/utils/session/heartbeat`,
    },

    // Symbol Management
    SYMBOLS: {
        LIST: `${API_BASE_URL}/symbols`,
    },

    // Historical Data Endpoints (currently using "fake" routes)
    HISTORICAL: {
        // Regular OHLC data
        REGULAR: {
            INITIAL: `${API_BASE_URL}/historical/`,
            CHUNK: `${API_BASE_URL}/historical/chunk`,
        },
        // Heikin Ashi data
        HEIKIN_ASHI: {
            INITIAL: `${API_BASE_URL}/heikin-ashi/`,
            CHUNK: `${API_BASE_URL}/heikin-ashi/chunk`,
        },
        // Tick data
        TICK: {
            INITIAL: `${API_BASE_URL}/tick/`,
            CHUNK: `${API_BASE_URL}/tick/chunk`,
        },
    },

    // Analysis Endpoints
    ANALYSIS: {
        REGRESSION: `${API_BASE_URL}/regression`,
    },

    // WebSocket Endpoints
    WEBSOCKET: {
        // Live data feeds
        LIVE: {
            REGULAR: (symbol, interval, timezone) => {
                const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                return `${wsProtocol}//${window.location.host}/ws/live/${encodeURIComponent(symbol)}/${interval}/${encodeURIComponent(timezone)}`;
            },
            HEIKIN_ASHI: (symbol, interval, timezone) => {
                const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
                return `${wsProtocol}//${window.location.host}/ws-ha/live/${encodeURIComponent(symbol)}/${interval}/${encodeURIComponent(timezone)}`;
            },
        },
    },
};

/**
 * Helper function to build URL with query parameters
 * @param {string} baseUrl - The base URL
 * @param {Object} params - Query parameters as key-value pairs
 * @returns {string} Complete URL with query parameters
 */
export function buildUrl(baseUrl, params) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            url.searchParams.append(key, value);
        }
    });
    return url.toString();
}

/**
 * Helper to get appropriate endpoint based on data type
 * @param {string} dataType - 'regular', 'heikin_ashi', or 'tick'
 * @param {string} endpointType - 'initial' or 'chunk'
 * @returns {string} The appropriate endpoint URL
 */
export function getDataEndpoint(dataType, endpointType) {
    const endpoints = {
        regular: API_ENDPOINTS.HISTORICAL.REGULAR,
        heikin_ashi: API_ENDPOINTS.HISTORICAL.HEIKIN_ASHI,
        tick: API_ENDPOINTS.HISTORICAL.TICK,
    };

    const dataEndpoints = endpoints[dataType];
    if (!dataEndpoints) {
        throw new Error(`Invalid data type: ${dataType}`);
    }

    return endpointType === 'initial' ? dataEndpoints.INITIAL : dataEndpoints.CHUNK;
}

/**
 * Get WebSocket URL based on data type
 * @param {string} dataType - 'regular', 'heikin_ashi', or 'tick'
 * @param {string} symbol - Trading symbol
 * @param {string} interval - Time interval
 * @param {string} timezone - Timezone
 * @returns {string} WebSocket URL
 */
export function getWebSocketUrl(dataType, symbol, interval, timezone) {
    if (dataType === 'heikin_ashi') {
        return API_ENDPOINTS.WEBSOCKET.LIVE.HEIKIN_ASHI(symbol, interval, timezone);
    }
    // Both 'regular' and 'tick' use the same WebSocket endpoint
    return API_ENDPOINTS.WEBSOCKET.LIVE.REGULAR(symbol, interval, timezone);
}