/**
 * @file api/services/session.service.js
 * @description Session management API service
 */

import { get, post } from '../client.js';
import { API_ENDPOINTS } from '../endpoints.js';

/**
 * Session service for managing user sessions
 */
export const sessionService = {
    /**
     * Initiate a new session
     * @returns {Promise<{session_token: string}>} Session information
     */
    async initiate() {
        return get(API_ENDPOINTS.SESSION.INITIATE);
    },

    /**
     * Send heartbeat to keep session alive
     * @param {string} sessionToken - The session token
     * @returns {Promise<{status: string}>} Heartbeat response
     */
    async sendHeartbeat(sessionToken) {
        return post(API_ENDPOINTS.SESSION.HEARTBEAT, {
            session_token: sessionToken,
        });
    },
};