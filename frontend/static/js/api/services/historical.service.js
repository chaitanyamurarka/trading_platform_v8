/**
 * @file api/services/historical.service.js
 * @description Historical data API service
 */

import { get } from '../client.js';
import { buildUrl, getDataEndpoint } from '../endpoints.js';

/**
 * Historical data service for fetching OHLC data
 */
export const historicalService = {
    /**
     * Fetch initial historical data
     * @param {Object} params - Request parameters
     * @param {string} params.sessionToken - Session token
     * @param {string} params.exchange - Exchange name
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.interval - Time interval
     * @param {string} params.startTime - Start time ISO string
     * @param {string} params.endTime - End time ISO string
     * @param {string} params.timezone - Timezone
     * @param {string} params.dataType - Data type: 'regular', 'heikin_ashi', or 'tick'
     * @returns {Promise<Object>} Historical data response
     */
    async fetchInitialData({
        sessionToken,
        exchange,
        symbol,
        interval,
        startTime,
        endTime,
        timezone,
        dataType = 'regular'
    }) {
        const endpoint = getDataEndpoint(dataType, 'initial');
        const url = buildUrl(endpoint, {
            session_token: sessionToken,
            exchange,
            token: symbol,
            interval,
            start_time: startTime,
            end_time: endTime,
            timezone,
        });

        return get(url);
    },

    /**
     * Fetch a chunk of historical data
     * @param {Object} params - Request parameters
     * @param {string} params.requestId - Request ID for pagination
     * @param {number} params.offset - Offset for pagination (may be ignored for cursor-based)
     * @param {number} params.limit - Maximum number of records
     * @param {string} params.dataType - Data type: 'regular', 'heikin_ashi', or 'tick'
     * @returns {Promise<Object>} Historical data chunk response
     */
    async fetchChunk({
        requestId,
        offset = 0,
        limit = 5000,
        dataType = 'regular'
    }) {
        const endpoint = getDataEndpoint(dataType, 'chunk');
        const url = buildUrl(endpoint, {
            request_id: requestId,
            offset: dataType === 'tick' ? undefined : offset, // Tick data doesn't use offset
            limit,
        });

        return get(url);
    },

    /**
     * Helper to determine if interval is tick-based
     * @param {string} interval - Interval string
     * @returns {boolean} True if tick-based
     */
    isTickInterval(interval) {
        return interval.includes('tick');
    },

    /**
     * Helper to determine appropriate data type
     * @param {string} interval - Interval string
     * @param {string} candleType - Candle type from UI
     * @returns {string} Data type for API
     */
    getDataType(interval, candleType) {
        if (this.isTickInterval(interval)) {
            return 'tick';
        }
        return candleType === 'heikin_ashi' ? 'heikin_ashi' : 'regular';
    },
};