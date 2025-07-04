/**
 * @file components/chart/chart.series.js
 * @description Chart series management
 */

import { appState, stateHelpers } from '../../core/state/index.js';
import { CONSTANTS } from '../../core/state/constants.js';
import { ChartConfig } from './chart.config.js';
import { getElementById } from '../../utils/dom.utils.js';

/**
 * Series Manager - Handles all chart series operations
 */
export class SeriesManager {
    constructor(chart) {
        this.chart = chart;
        this.mainSeries = null;
        this.volumeSeries = null;
        this.config = new ChartConfig();
    }

    /**
     * Create main price series
     * @param {string} type - Series type
     * @returns {Object} Created series
     */
    createMainSeries(type = CONSTANTS.CHART_TYPES.CANDLESTICK) {
        // Remove existing series if any
        if (this.mainSeries) {
            this.chart.removeSeries(this.mainSeries);
        }

        // Get series options
        const seriesOptions = this.getSeriesOptions();

        // Create new series based on type
        switch (type) {
            case CONSTANTS.CHART_TYPES.BAR:
                this.mainSeries = this.chart.addBarSeries(seriesOptions);
                break;

            case CONSTANTS.CHART_TYPES.LINE:
                this.mainSeries = this.chart.addLineSeries(
                    this.config.getLineSeriesOptions(seriesOptions.upColor)
                );
                break;

            case CONSTANTS.CHART_TYPES.AREA:
                this.mainSeries = this.chart.addAreaSeries(
                    this.config.getAreaSeriesOptions(seriesOptions.upColor)
                );
                break;

            default:
                this.mainSeries = this.chart.addCandlestickSeries(seriesOptions);
                break;
        }

        // Update state
        appState.chart.mainSeries = this.mainSeries;
        appState.chart.type = type;

        // Set existing data if available
        const currentData = stateHelpers.getCurrentChartData();
        if (currentData.length > 0) {
            this.mainSeries.setData(currentData);
        }

        return this.mainSeries;
    }

    /**
     * Create volume series
     * @returns {Object} Created volume series
     */
    createVolumeSeries() {
        if (this.volumeSeries) {
            this.chart.removeSeries(this.volumeSeries);
        }

        this.volumeSeries = this.chart.addHistogramSeries(
            this.config.getVolumeSeriesOptions()
        );

        // Update state
        appState.chart.volumeSeries = this.volumeSeries;

        // Set existing data if available
        const currentVolumeData = stateHelpers.getCurrentVolumeData();
        if (currentVolumeData.length > 0) {
            this.volumeSeries.setData(currentVolumeData);
        }

        return this.volumeSeries;
    }

    /**
     * Get series options from DOM inputs
     * @returns {Object} Series options
     */
    getSeriesOptions() {
        const upColorInput = getElementById('setting-up-color');
        const downColorInput = getElementById('setting-down-color');
        const wickUpColorInput = getElementById('setting-wick-up-color');
        const wickDownColorInput = getElementById('setting-wick-down-color');
        const disableWicksInput = getElementById('setting-disable-wicks');

        const colors = {
            up: upColorInput?.value || CONSTANTS.COLORS.UP,
            down: downColorInput?.value || CONSTANTS.COLORS.DOWN,
            wickUp: wickUpColorInput?.value || CONSTANTS.COLORS.UP,
            wickDown: wickDownColorInput?.value || CONSTANTS.COLORS.DOWN,
        };

        const disableWicks = disableWicksInput?.checked || false;

        return this.config.getSeriesOptions(colors, disableWicks);
    }

    /**
     * Update main series data
     * @param {Array} data - Chart data
     */
    updateMainSeriesData(data) {
        if (this.mainSeries && data) {
            this.mainSeries.setData(data);
        }
    }

    /**
     * Update volume series data
     * @param {Array} data - Volume data
     */
    updateVolumeSeriesData(data) {
        if (this.volumeSeries && data) {
            this.volumeSeries.setData(data);
        }
    }

    /**
     * Update single data point
     * @param {Object} bar - Bar data
     */
    updateBar(bar) {
        if (this.mainSeries && bar) {
            this.mainSeries.update(bar);
        }
    }

    /**
     * Update single volume bar
     * @param {Object} volume - Volume data
     */
    updateVolumeBar(volume) {
        if (this.volumeSeries && volume) {
            this.volumeSeries.update(volume);
        }
    }

    /**
     * Apply new colors to series
     */
    applySeriesColors() {
        const type = appState.chart.type;
        this.createMainSeries(type);
    }

    /**
     * Apply new colors to volume series
     */
    applyVolumeColors() {
        const currentData = stateHelpers.getCurrentChartData();
        const volumeData = stateHelpers.getCurrentVolumeData();

        if (!this.volumeSeries || !currentData.length || !volumeData.length) {
            return;
        }

        const volUpColorInput = getElementById('setting-vol-up-color');
        const volDownColorInput = getElementById('setting-vol-down-color');

        const upColor = volUpColorInput?.value || CONSTANTS.COLORS.UP;
        const downColor = volDownColorInput?.value || CONSTANTS.COLORS.DOWN;

        // Create price action map
        const priceActionMap = new Map();
        currentData.forEach(priceData => {
            priceActionMap.set(priceData.time, priceData.close >= priceData.open);
        });

        // Update volume colors
        const newVolumeData = volumeData.map(volume => ({
            ...volume,
            color: priceActionMap.get(volume.time)
                ? upColor + CONSTANTS.COLORS.VOLUME_OPACITY
                : downColor + CONSTANTS.COLORS.VOLUME_OPACITY,
        }));

        this.volumeSeries.setData(newVolumeData);
    }

    /**
     * Get main series data
     * @returns {Array} Series data
     */
    getMainSeriesData() {
        return stateHelpers.getCurrentChartData();
    }

    /**
     * Get volume series data
     * @returns {Array} Volume data
     */
    getVolumeSeriesData() {
        return stateHelpers.getCurrentVolumeData();
    }

    /**
     * Destroy series manager
     */
    destroy() {
        this.mainSeries = null;
        this.volumeSeries = null;
        appState.chart.mainSeries = null;
        appState.chart.volumeSeries = null;
    }
}