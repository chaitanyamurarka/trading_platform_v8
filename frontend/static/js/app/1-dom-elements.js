// frontend/static/js/app/1-dom-elements.js

/**
 * Centralized function to get all relevant DOM elements.
 * This approach enhances modularity and makes it easier to manage
 * and potentially mock DOM interactions for testing or future framework integration.
 * @returns {Object.<string, HTMLElement|null>} An object containing references to DOM elements.
 */
export function getDomElements() {
    const elements = {
        chartContainer: document.getElementById('chartContainer'),
        exchangeSelect: document.getElementById('exchange'),
        symbolSelect: document.getElementById('symbol'),
        intervalSelect: document.getElementById('interval'),
        startTimeInput: document.getElementById('start_time'),
        endTimeInput: document.getElementById('end_time'),
        themeToggle: document.getElementById('theme-toggle'),
        dataSummaryElement: document.getElementById('dataSummary'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        timezoneSelect: document.getElementById('timezone'),
        chartTypeSelect: document.getElementById('chart-type'),
        screenshotBtn: document.getElementById('screenshot-btn'),

        // Live mode controls
        liveToggle: document.getElementById('live-toggle'),

        // OHLC Data Legend - This is the key element for the tooltip functionality
        dataLegendElement: document.getElementById('data-legend'),

        // Drawing Tools Toolbar
        toolTrendLineBtn: document.getElementById('tool-trend-line'),
        toolHorizontalLineBtn: document.getElementById('tool-horizontal-line'),
        toolFibRetracementBtn: document.getElementById('tool-fib-retracement'),
        toolRectangleBtn: document.getElementById('tool-rectangle'),
        toolBrushBtn: document.getElementById('tool-brush'),
        toolRemoveSelectedBtn: document.getElementById('tool-remove-selected'),
        toolRemoveAllBtn: document.getElementById('tool-remove-all'),

        // Settings Modal
        settingsModal: document.getElementById('settings_modal'),
        gridColorInput: document.getElementById('setting-grid-color'),
        watermarkInput: document.getElementById('setting-watermark-text'),
        upColorInput: document.getElementById('setting-up-color'),
        downColorInput: document.getElementById('setting-down-color'),
        wickUpColorInput: document.getElementById('setting-wick-up-color'),
        wickDownColorInput: document.getElementById('setting-wick-down-color'),
        volUpColorInput: document.getElementById('setting-vol-up-color'),
        volDownColorInput: document.getElementById('setting-vol-down-color'),
        disableWicksInput: document.getElementById('setting-disable-wicks'),

        showOHLCLegendToggle: document.getElementById('setting-show-ohlc-legend'),

        candleTypeSelect: document.getElementById('candle-type-select'),

        // NEW: Add responsive sidebar elements
        menuToggle: document.getElementById('menu-toggle'),
        sidebar: document.getElementById('sidebar'),
        sidebarOverlay: document.getElementById('sidebar-overlay'),

        // MODIFIED: Indicator Elements
        indicatorModal: document.getElementById('indicator_modal'),
        indicatorSelect: document.getElementById('indicator-select'),
        indicatorApplyBtn: document.getElementById('indicator-apply-btn'),
        removeRegressionBtn: document.getElementById('remove-regression-btn'),
        regressionLengthInput: document.getElementById('indicator-regression-length'),
        lookbackPeriodsInput: document.getElementById('indicator-lookback-periods'),
        timeframesContainer: document.getElementById('indicator-timeframes'),
        regressionTableContainer: document.getElementById('regression-table-container'),
        regressionTable: document.getElementById('regression-table'),
    };

    // Handle elements that might not exist initially or require a querySelector
    elements.regressionTableHead = elements.regressionTable ? elements.regressionTable.querySelector('thead') : null;
    elements.regressionTableBody = elements.regressionTable ? elements.regressionTable.querySelector('tbody') : null;

    return elements;
}