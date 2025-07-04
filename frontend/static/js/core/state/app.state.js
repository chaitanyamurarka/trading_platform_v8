/**
 * @file core/state/app.state.js
 * @description Centralized application state management
 */

import { CONSTANTS } from './constants.js';

/**
 * Application state object
 * This is the single source of truth for all application state
 */
export const appState = {
    // Chart and Series objects
    chart: {
        instance: null,
        mainSeries: null,
        volumeSeries: null,
        type: 'candlestick', // candlestick, bar, line, area
    },

    // Session state
    session: {
        token: null,
        heartbeatIntervalId: null,
        isActive: false,
    },

    // UI state
    ui: {
        isLoadingHistoricalData: false,
        showOHLCLegend: true,
        theme: 'light',
        sidebarOpen: false,
    },

    // Data state
    data: {
        candleType: 'regular', // 'regular', 'heikin_ashi', 'tick'
        interval: '1m',
        timezone: 'America/New_York',
        isLive: false,
        currentlyFetching: false,
        
        // Available symbols
        availableSymbols: [],
        
        // WebSocket message buffer
        websocketMessageBuffer: [],
        
        // Regular candle data
        regular: {
            requestId: null,
            candles: [],
            volume: [],
            offset: 0,
            allDataLoaded: false,
        },
        
        // Heikin Ashi data
        heikinAshi: {
            requestId: null,
            candles: [],
            volume: [],
            offset: 0,
            allDataLoaded: false,
        },
        
        // Tick data
        tick: {
            requestId: null,
            candles: [],
            volume: [],
            offset: 0,
            allDataLoaded: false,
        },
    },

    // Indicators state
    indicators: {
        isActive: false,
        activeSymbol: null,
        regression: {
            settings: {
                length: 4,
                lookbackPeriods: [0, 1, 2, 3, 4, 5],
                timeframes: ['10s', '30s', '1m', '5m'],
            },
            results: null,
        },
    },

    // WebSocket connections
    websockets: {
        live: null,
        heikinAshi: null,
    },
};

/**
 * State helper methods
 */
export const stateHelpers = {
    /**
     * Get current chart data based on candle type
     * @returns {Array} Current candle data
     */
    getCurrentChartData() {
        const { candleType } = appState.data;
        switch (candleType) {
            case 'heikin_ashi':
                return appState.data.heikinAshi.candles;
            case 'tick':
                return appState.data.tick.candles;
            default:
                return appState.data.regular.candles;
        }
    },

    /**
     * Get current volume data based on candle type
     * @returns {Array} Current volume data
     */
    getCurrentVolumeData() {
        const { candleType } = appState.data;
        switch (candleType) {
            case 'heikin_ashi':
                return appState.data.heikinAshi.volume;
            case 'tick':
                return appState.data.tick.volume;
            default:
                return appState.data.regular.volume;
        }
    },

    /**
     * Get current request ID based on candle type
     * @returns {string|null} Current request ID
     */
    getCurrentRequestId() {
        const { candleType } = appState.data;
        switch (candleType) {
            case 'heikin_ashi':
                return appState.data.heikinAshi.requestId;
            case 'tick':
                return appState.data.tick.requestId;
            default:
                return appState.data.regular.requestId;
        }
    },

    /**
     * Check if all data is loaded based on candle type
     * @returns {boolean} True if all data is loaded
     */
    isAllDataLoaded() {
        const { candleType } = appState.data;
        switch (candleType) {
            case 'heikin_ashi':
                return appState.data.heikinAshi.allDataLoaded;
            case 'tick':
                return appState.data.tick.allDataLoaded;
            default:
                return appState.data.regular.allDataLoaded;
        }
    },

    /**
     * Reset all data arrays and flags
     */
    resetAllData() {
        // Reset regular data
        appState.data.regular = {
            requestId: null,
            candles: [],
            volume: [],
            offset: 0,
            allDataLoaded: false,
        };

        // Reset Heikin Ashi data
        appState.data.heikinAshi = {
            requestId: null,
            candles: [],
            volume: [],
            offset: 0,
            allDataLoaded: false,
        };

        // Reset tick data
        appState.data.tick = {
            requestId: null,
            candles: [],
            volume: [],
            offset: 0,
            allDataLoaded: false,
        };

        console.log('All chart data states have been reset.');
    },

    /**
     * Reset indicator state
     */
    resetIndicatorState() {
        appState.indicators.isActive = false;
        appState.indicators.activeSymbol = null;
        appState.indicators.regression.results = null;
    },

    /**
     * Update data state for a specific type
     * @param {string} dataType - 'regular', 'heikin_ashi', or 'tick'
     * @param {Object} updates - Updates to apply
     */
    updateDataState(dataType, updates) {
        const stateKey = dataType === 'heikin_ashi' ? 'heikinAshi' : dataType;
        if (appState.data[stateKey]) {
            Object.assign(appState.data[stateKey], updates);
        }
    },
};

// Freeze the constants to prevent modification
Object.freeze(CONSTANTS);