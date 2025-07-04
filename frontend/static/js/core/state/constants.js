/**
 * @file core/state/constants.js
 * @description Application-wide constants
 */

export const CONSTANTS = {
    // Data fetching
    DATA_CHUNK_SIZE: 5000,
    INITIAL_FETCH_LIMIT: 5000,
    
    // WebSocket
    WS_RECONNECT_DELAY: 3000,
    WS_MAX_RECONNECT_ATTEMPTS: 5,
    
    // UI
    TOAST_DURATION: 4000,
    CHART_MIN_WIDTH: 300,
    CHART_MIN_HEIGHT: 200,
    VISIBLE_BARS_ON_LOAD: 100,
    
    // Session
    HEARTBEAT_INTERVAL: 60000, // 1 minute
    SESSION_TIMEOUT: 2700000, // 45 minutes
    
    // Chart types
    CHART_TYPES: {
        CANDLESTICK: 'candlestick',
        BAR: 'bar',
        LINE: 'line',
        AREA: 'area',
    },
    
    // Candle types
    CANDLE_TYPES: {
        REGULAR: 'regular',
        HEIKIN_ASHI: 'heikin_ashi',
        TICK: 'tick',
    },
    
    // Default values
    DEFAULTS: {
        THEME: 'light',
        TIMEZONE: 'America/New_York',
        INTERVAL: '1m',
        EXCHANGE: 'NASDAQ',
        CHART_TYPE: 'candlestick',
        CANDLE_TYPE: 'regular',
    },
    
    // Colors
    COLORS: {
        UP: '#10b981',
        DOWN: '#ef4444',
        VOLUME_OPACITY: '80',
    },
    
    // Intervals
    INTERVALS: {
        TICK: ['1tick', '10tick', '100tick', '1000tick'],
        SECONDS: ['1s', '5s', '10s', '15s', '30s', '45s'],
        MINUTES: ['1m', '5m', '10m', '15m', '30m', '45m'],
        HOURS_DAYS: ['1h', '1d'],
    },
};