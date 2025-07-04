/**
 * @file api/services/symbols.service.js
 * @description Symbol management API service
 */

import { get } from '../client.js';
import { API_ENDPOINTS } from '../endpoints.js';

/**
 * Symbol service for fetching available trading symbols
 */
export const symbolService = {
    /**
     * Fetch all available symbols
     * @returns {Promise<Array<{symbol: string, exchange: string}>>} List of symbols
     */
    async fetchAll() {
        return get(API_ENDPOINTS.SYMBOLS.LIST);
    },

    /**
     * Fetch symbols for a specific exchange
     * @param {string} exchange - Exchange name
     * @returns {Promise<Array<{symbol: string, exchange: string}>>} Filtered symbols
     */
    async fetchByExchange(exchange) {
        const allSymbols = await this.fetchAll();
        return allSymbols.filter(s => s.exchange === exchange);
    },
};