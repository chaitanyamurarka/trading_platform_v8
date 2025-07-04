/**
 * @file api/services/analysis.service.js
 * @description Analysis and indicators API service
 */

import { post } from '../client.js';
import { API_ENDPOINTS } from '../endpoints.js';

/**
 * Analysis service for technical indicators and analysis
 */
export const analysisService = {
    /**
     * Run linear regression analysis
     * @param {Object} params - Regression parameters
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.exchange - Exchange name
     * @param {number} params.regressionLength - Number of candles for regression
     * @param {number[]} params.lookbackPeriods - Array of lookback periods
     * @param {string[]} params.timeframes - Array of timeframes
     * @returns {Promise<Object>} Regression analysis results
     */
    async runRegression({
        symbol,
        exchange,
        regressionLength,
        lookbackPeriods,
        timeframes,
    }) {
        return post(API_ENDPOINTS.ANALYSIS.REGRESSION, {
            symbol,
            exchange,
            regression_length: regressionLength,
            lookback_periods: lookbackPeriods,
            timeframes,
        });
    },

    /**
     * Validate regression parameters
     * @param {Object} params - Parameters to validate
     * @returns {{valid: boolean, errors: string[]}} Validation result
     */
    validateRegressionParams({
        regressionLength,
        lookbackPeriods,
        timeframes,
    }) {
        const errors = [];

        if (!regressionLength || regressionLength < 2) {
            errors.push('Regression length must be at least 2');
        }

        if (!lookbackPeriods || !Array.isArray(lookbackPeriods) || lookbackPeriods.length === 0) {
            errors.push('At least one lookback period is required');
        }

        if (!timeframes || !Array.isArray(timeframes) || timeframes.length === 0) {
            errors.push('At least one timeframe is required');
        }

        return {
            valid: errors.length === 0,
            errors,
        };
    },
};