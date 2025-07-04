/**
 * @file api.js
 * @description Manages all API communication with the backend server.
 * This module abstracts the details of HTTP requests using the Fetch API,
 * providing dedicated functions for session management and data retrieval.
 */

// --- API Configuration ---
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000`;

// --- Session Management Functions ---

export function initiateSession() {
    return fetch(`${API_BASE_URL}/utils/session/initiate`).then(res => res.json());
}

export function sendHeartbeat(token) {
    return fetch(`${API_BASE_URL}/utils/session/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_token: token }),
    }).then(res => res.json());
}

// --- Data & Indicator Functions ---

export function getHistoricalDataUrl(sessionToken, exchange, token, interval, startTime, endTime, timezone) {
    const params = new URLSearchParams({ session_token: sessionToken, exchange, token, interval, start_time: startTime, end_time: endTime, timezone });
    return `${API_BASE_URL}/historical/?${params.toString()}`;
}

export function getHistoricalDataChunkUrl(requestId, offset, limit = 5000) {
    const params = new URLSearchParams({ request_id: requestId, offset, limit });
    return `${API_BASE_URL}/historical/chunk?${params.toString()}`;
}

export function getHeikinAshiDataUrl(sessionToken, exchange, token, interval, startTime, endTime, timezone) {
    const params = new URLSearchParams({ session_token: sessionToken, exchange, token, interval, start_time: startTime, end_time: endTime, timezone });
    return `${API_BASE_URL}/heikin-ashi/?${params.toString()}`;
}

export async function fetchHeikinAshiData(sessionToken, exchange, token, interval, startTime, endTime, timezone) {
    const url = getHeikinAshiDataUrl(sessionToken, exchange, token, interval, startTime, endTime, timezone);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

export function getHeikinAshiDataChunkUrl(requestId, offset, limit = 5000) {
    const params = new URLSearchParams({ request_id: requestId, offset, limit });
    return `${API_BASE_URL}/heikin-ashi/chunk?${params.toString()}`;
}

export async function fetchHeikinAshiChunk(requestId, offset, limit = 5000) {
    const url = getHeikinAshiDataChunkUrl(requestId, offset, limit);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

export async function fetchSymbols() {
    const response = await fetch(`${API_BASE_URL}/symbols`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
}

/**
 * NEW: Fetches linear regression analysis data from the backend.
 * @param {object} requestBody - The request payload for the regression analysis.
 * @returns {Promise<Object>} A promise that resolves to the regression analysis results.
 */
export async function fetchRegressionData(requestBody) {
    const response = await fetch(`${API_BASE_URL}/regression`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Network error' }));
        throw new Error(`Regression API error: ${error.detail || response.statusText}`);
    }
    return await response.json();
}
