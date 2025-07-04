/**
 * @file components/chart/chart.manager.js
 * @description Main chart management component
 */

import { appState } from '../../core/state/index.js';
import { CONSTANTS } from '../../core/state/constants.js';
import { getElementById } from '../../utils/dom.utils.js';
import { ChartConfig } from './chart.config.js';
import { SeriesManager } from './chart.series.js';

/**
 * Chart Manager - Handles chart lifecycle and coordination
 */
export class ChartManager {
    constructor() {
        this.container = null;
        this.chart = null;
        this.seriesManager = null;
        this.config = new ChartConfig();
    }

    /**
     * Initialize the chart
     * @param {string} containerId - Container element ID
     * @param {string} theme - Theme name
     */
    initialize(containerId, theme = 'light') {
        this.container = getElementById(containerId);
        if (!this.container) {
            throw new Error(`Chart container '${containerId}' not found`);
        }

        // Remove existing chart if any
        this.destroy();

        // Create new chart
        this.chart = LightweightCharts.createChart(
            this.container,
            this.config.getChartOptions(theme)
        );

        // Initialize series manager
        this.seriesManager = new SeriesManager(this.chart);

        // Update state
        appState.chart.instance = this.chart;

        // Setup volume scale
        this.chart.priceScale('').applyOptions({
            scaleMargins: { top: 0.85, bottom: 0 },
        });

        return this.chart;
    }

    /**
     * Create main price series
     * @param {string} type - Series type
     */
    createMainSeries(type = CONSTANTS.CHART_TYPES.CANDLESTICK) {
        return this.seriesManager.createMainSeries(type);
    }

    /**
     * Create volume series
     */
    createVolumeSeries() {
        return this.seriesManager.createVolumeSeries();
    }

    /**
     * Update chart theme
     * @param {string} theme - Theme name
     */
    updateTheme(theme) {
        if (this.chart) {
            this.chart.applyOptions(this.config.getChartOptions(theme));
        }
    }

    /**
     * Resize chart
     * @param {number} width - New width
     * @param {number} height - New height
     */
    resize(width, height) {
        if (this.chart) {
            const finalWidth = Math.max(width, CONSTANTS.CHART_MIN_WIDTH);
            const finalHeight = Math.max(height, CONSTANTS.CHART_MIN_HEIGHT);
            this.chart.resize(finalWidth, finalHeight, true);
        }
    }

    /**
     * Auto-scale chart
     */
    autoScale() {
        if (!this.chart) return;

        this.chart.priceScale().applyOptions({ autoScale: true });
        this.chart.timeScale().applyOptions({ rightOffset: 12 });

        // Set visible range to most recent bars
        const data = this.seriesManager.getMainSeriesData();
        if (data && data.length > 0) {
            const visibleBars = CONSTANTS.VISIBLE_BARS_ON_LOAD;
            this.chart.timeScale().setVisibleLogicalRange({
                from: Math.max(0, data.length - visibleBars),
                to: data.length - 1,
            });
        }

        // Scroll to latest bar
        this.chart.timeScale().scrollToRealTime();
    }

    /**
     * Set linear scaling
     */
    setLinearScale() {
        if (this.chart) {
            this.chart.priceScale().applyOptions({ autoScale: false });
            this.chart.timeScale().applyOptions({ rightOffset: 0 });
        }
    }

    /**
     * Take screenshot
     * @returns {string} Data URL of screenshot
     */
    takeScreenshot() {
        if (!this.chart) return null;

        const canvas = this.chart.takeScreenshot();
        return canvas.toDataURL();
    }

    /**
     * Subscribe to crosshair move
     * @param {Function} handler - Handler function
     */
    subscribeCrosshairMove(handler) {
        if (this.chart) {
            this.chart.subscribeCrosshairMove(handler);
        }
    }

    /**
     * Subscribe to visible range change
     * @param {Function} handler - Handler function
     */
    subscribeVisibleRangeChange(handler) {
        if (this.chart) {
            this.chart.timeScale().subscribeVisibleLogicalRangeChange(handler);
        }
    }

    /**
     * Get chart instance
     * @returns {object} Chart instance
     */
    getChart() {
        return this.chart;
    }

    /**
     * Get series manager
     * @returns {SeriesManager} Series manager instance
     */
    getSeriesManager() {
        return this.seriesManager;
    }

    /**
     * Destroy chart
     */
    destroy() {
        if (this.chart) {
            this.chart.remove();
            this.chart = null;
        }

        if (this.seriesManager) {
            this.seriesManager.destroy();
            this.seriesManager = null;
        }

        appState.chart.instance = null;
    }
}

// Export singleton instance
export const chartManager = new ChartManager();