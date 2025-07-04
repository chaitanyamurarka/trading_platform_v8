/**
 * @file api/client.js
 * @description HTTP client with common configuration and error handling
 */

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Default options for fetch requests
 */
const DEFAULT_OPTIONS = {
    headers: {
        'Content-Type': 'application/json',
    },
};

/**
 * Generic fetch wrapper with error handling
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiRequest(url, options = {}) {
    const mergedOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        headers: {
            ...DEFAULT_OPTIONS.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, mergedOptions);

        if (!response.ok) {
            // Try to parse error response
            const errorData = await response.json().catch(() => ({
                detail: `HTTP ${response.status}: ${response.statusText}`,
            }));

            throw new ApiError(
                errorData.detail || response.statusText,
                response.status,
                errorData
            );
        }

        // Handle empty responses
        const text = await response.text();
        if (!text) {
            return null;
        }

        // Parse JSON response
        try {
            return JSON.parse(text);
        } catch (e) {
            // If not JSON, return the text
            return text;
        }
    } catch (error) {
        // Re-throw ApiError instances
        if (error instanceof ApiError) {
            throw error;
        }

        // Wrap network errors
        throw new ApiError(
            error.message || 'Network error',
            0,
            { originalError: error }
        );
    }
}

/**
 * GET request helper
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response
 */
export function get(url, options = {}) {
    return apiRequest(url, {
        ...options,
        method: 'GET',
    });
}

/**
 * POST request helper
 * @param {string} url - The URL to fetch
 * @param {any} data - Data to send in request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response
 */
export function post(url, data, options = {}) {
    return apiRequest(url, {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * PUT request helper
 * @param {string} url - The URL to fetch
 * @param {any} data - Data to send in request body
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response
 */
export function put(url, data, options = {}) {
    return apiRequest(url, {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
    });
}

/**
 * DELETE request helper
 * @param {string} url - The URL to fetch
 * @param {Object} options - Additional fetch options
 * @returns {Promise<any>} Parsed response
 */
export function del(url, options = {}) {
    return apiRequest(url, {
        ...options,
        method: 'DELETE',
    });
}