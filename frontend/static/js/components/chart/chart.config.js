/**
 * @file components/chart/chart.config.js
 * @description Chart configuration and options
 */

import { CONSTANTS } from '../../core/state/constants.js';

/**
 * Chart configuration class
 */
export class ChartConfig {
    /**
     * Get chart options for a specific theme
     * @param {string} theme - Theme name ('light' or 'dark')
     * @returns {Object} Chart options
     */
    getChartOptions(theme = 'light') {
        const isDark = theme === 'dark';
        
        return {
            layout: {
                background: { 
                    type: 'solid', 
                    color: isDark ? '#1d232a' : '#ffffff' 
                },
                textColor: isDark ? '#a6adba' : '#1f2937',
            },
            grid: {
                vertLines: { 
                    color: isDark ? '#2a323c' : '#e5e7eb' 
                },
                horzLines: { 
                    color: isDark ? '#2a323c' : '#e5e7eb' 
                },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
            },
            rightPriceScale: {
                borderColor: isDark ? '#2a323c' : '#e5e7eb',
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderColor: isDark ? '#2a323c' : '#e5e7eb',
                shiftVisibleRangeOnNewBar: false,
            },
            watermark: {
                color: 'rgba(150, 150, 150, 0.2)',
                visible: true,
                text: 'EigenKor',
                fontSize: 48,
                horzAlign: 'center',
                vertAlign: 'center',
            },
        };
    }

    /**
     * Get series options
     * @param {Object} colors - Color configuration
     * @param {boolean} disableWicks - Whether to disable wicks
     * @returns {Object} Series options
     */
    getSeriesOptions(colors = {}, disableWicks = false) {
        const defaultColors = {
            up: CONSTANTS.COLORS.UP,
            down: CONSTANTS.COLORS.DOWN,
            wickUp: CONSTANTS.COLORS.UP,
            wickDown: CONSTANTS.COLORS.DOWN,
            ...colors,
        };

        const options = {
            upColor: defaultColors.up,
            downColor: defaultColors.down,
            borderUpColor: defaultColors.up,
            borderDownColor: defaultColors.down,
        };

        if (disableWicks) {
            options.wickUpColor = 'rgba(0,0,0,0)';
            options.wickDownColor = 'rgba(0,0,0,0)';
        } else {
            options.wickUpColor = defaultColors.wickUp;
            options.wickDownColor = defaultColors.wickDown;
        }

        return options;
    }

    /**
     * Get volume series options
     * @returns {Object} Volume series options
     */
    getVolumeSeriesOptions() {
        return {
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
        };
    }

    /**
     * Get line series options
     * @param {string} color - Line color
     * @returns {Object} Line series options
     */
    getLineSeriesOptions(color = CONSTANTS.COLORS.UP) {
        return {
            color,
            lineWidth: 2,
        };
    }

    /**
     * Get area series options
     * @param {string} lineColor - Line color
     * @returns {Object} Area series options
     */
    getAreaSeriesOptions(lineColor = CONSTANTS.COLORS.UP) {
        return {
            lineColor,
            topColor: `${lineColor}66`,
            bottomColor: `${lineColor}00`,
            lineWidth: 2,
        };
    }

    /**
     * Update watermark text
     * @param {Object} chart - Chart instance
     * @param {string} text - Watermark text
     */
    updateWatermark(chart, text) {
        if (chart) {
            chart.applyOptions({
                watermark: {
                    text,
                },
            });
        }
    }

    /**
     * Update grid colors
     * @param {Object} chart - Chart instance
     * @param {string} color - Grid color
     */
    updateGridColor(chart, color) {
        if (chart) {
            chart.applyOptions({
                grid: {
                    vertLines: { color },
                    horzLines: { color },
                },
            });
        }
    }
}