/**
 * @file api/services/websocket.service.js
 * @description WebSocket management service
 */

import { getWebSocketUrl } from '../endpoints.js';

/**
 * WebSocket connection states
 */
export const WS_STATES = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
};

/**
 * WebSocket service for managing live data connections
 */
export const websocketService = {
    connections: new Map(),

    /**
     * Create a WebSocket connection
     * @param {string} connectionId - Unique identifier for the connection
     * @param {Object} params - Connection parameters
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.interval - Time interval
     * @param {string} params.timezone - Timezone
     * @param {string} params.dataType - Data type: 'regular', 'heikin_ashi', or 'tick'
     * @param {Object} handlers - Event handlers
     * @param {Function} handlers.onOpen - Called when connection opens
     * @param {Function} handlers.onMessage - Called when message received
     * @param {Function} handlers.onClose - Called when connection closes
     * @param {Function} handlers.onError - Called on error
     * @returns {WebSocket} The WebSocket instance
     */
    connect(connectionId, params, handlers) {
        // Close existing connection if any
        this.disconnect(connectionId);

        const { symbol, interval, timezone, dataType } = params;
        const url = getWebSocketUrl(dataType, symbol, interval, timezone);

        const ws = new WebSocket(url);

        // Setup event handlers
        if (handlers.onOpen) {
            ws.addEventListener('open', handlers.onOpen);
        }

        if (handlers.onMessage) {
            ws.addEventListener('message', handlers.onMessage);
        }

        if (handlers.onClose) {
            ws.addEventListener('close', handlers.onClose);
        }

        if (handlers.onError) {
            ws.addEventListener('error', handlers.onError);
        }

        // Store connection
        this.connections.set(connectionId, ws);

        return ws;
    },

    /**
     * Disconnect a WebSocket connection
     * @param {string} connectionId - Connection identifier
     */
    disconnect(connectionId) {
        const ws = this.connections.get(connectionId);
        if (ws) {
            // Remove all event listeners to prevent memory leaks
            ws.onopen = null;
            ws.onmessage = null;
            ws.onclose = null;
            ws.onerror = null;

            // Close connection
            if (ws.readyState === WS_STATES.OPEN || ws.readyState === WS_STATES.CONNECTING) {
                ws.close();
            }

            // Remove from map
            this.connections.delete(connectionId);
        }
    },

    /**
     * Disconnect all WebSocket connections
     */
    disconnectAll() {
        for (const connectionId of this.connections.keys()) {
            this.disconnect(connectionId);
        }
    },

    /**
     * Get connection state
     * @param {string} connectionId - Connection identifier
     * @returns {number|null} WebSocket ready state or null if not connected
     */
    getState(connectionId) {
        const ws = this.connections.get(connectionId);
        return ws ? ws.readyState : null;
    },

    /**
     * Check if connection is open
     * @param {string} connectionId - Connection identifier
     * @returns {boolean} True if connection is open
     */
    isOpen(connectionId) {
        return this.getState(connectionId) === WS_STATES.OPEN;
    },

    /**
     * Send data through WebSocket
     * @param {string} connectionId - Connection identifier
     * @param {any} data - Data to send
     * @returns {boolean} True if sent successfully
     */
    send(connectionId, data) {
        const ws = this.connections.get(connectionId);
        if (ws && ws.readyState === WS_STATES.OPEN) {
            ws.send(typeof data === 'string' ? data : JSON.stringify(data));
            return true;
        }
        return false;
    },
};