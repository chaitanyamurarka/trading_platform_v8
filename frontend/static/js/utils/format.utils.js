/**
 * @file utils/format.utils.js
 * @description Formatting utilities for numbers, dates, and data display
 */

/**
 * Format price with specified decimal places
 * @param {number} price - Price value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
export function formatPrice(price, decimals = 2) {
    if (price === null || price === undefined) return 'N/A';
    return parseFloat(price).toFixed(decimals);
}

/**
 * Format volume with abbreviations (K, M, B)
 * @param {number} volume - Volume value
 * @returns {string} Formatted volume
 */
export function formatVolume(volume) {
    if (volume === null || volume === undefined) return 'N/A';
    
    const num = parseInt(volume);
    
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    
    return num.toString();
}

/**
 * Format percentage
 * @param {number} value - Percentage value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 2) {
    if (value === null || value === undefined) return 'N/A';
    return `${parseFloat(value).toFixed(decimals)}%`;
}

/**
 * Format change with sign
 * @param {number} value - Change value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted change with + or - sign
 */
export function formatChange(value, decimals = 2) {
    if (value === null || value === undefined) return 'N/A';
    
    const formatted = parseFloat(value).toFixed(decimals);
    return value >= 0 ? `+${formatted}` : formatted;
}

/**
 * Format number with commas
 * @param {number} value - Number to format
 * @returns {string} Formatted number with commas
 */
export function formatNumberWithCommas(value) {
    if (value === null || value === undefined) return 'N/A';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format date to locale string
 * @param {Date|string|number} date - Date to format
 * @param {string} locale - Locale string (default: 'en-US')
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(date, locale = 'en-US', options = {}) {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
    };
    
    return dateObj.toLocaleString(locale, defaultOptions);
}

/**
 * Format time only
 * @param {Date|string|number} date - Date to format
 * @param {boolean} includeSeconds - Include seconds in format
 * @returns {string} Formatted time
 */
export function formatTime(date, includeSeconds = false) {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        ...(includeSeconds && { second: '2-digit' }),
    };
    
    return dateObj.toLocaleTimeString('en-US', options);
}

/**
 * Format interval to human-readable string
 * @param {string} interval - Interval string (e.g., '1m', '5s', '1h')
 * @returns {string} Human-readable interval
 */
export function formatInterval(interval) {
    const unit = interval.slice(-1);
    const value = interval.slice(0, -1);
    
    const units = {
        s: 'second',
        m: 'minute',
        h: 'hour',
        d: 'day',
    };
    
    const unitName = units[unit] || unit;
    const plural = value !== '1' ? 's' : '';
    
    return `${value} ${unitName}${plural}`;
}

/**
 * Format tick interval
 * @param {string} interval - Tick interval (e.g., '100tick')
 * @returns {string} Formatted tick interval
 */
export function formatTickInterval(interval) {
    const ticks = interval.replace('tick', '');
    return `${ticks} tick${ticks !== '1' ? 's' : ''}`;
}

/**
 * Get color for value change
 * @param {number} value - Value to check
 * @param {Object} colors - Color configuration
 * @returns {string} Color for the value
 */
export function getChangeColor(value, colors = { up: '#26a69a', down: '#ef5350' }) {
    return value >= 0 ? colors.up : colors.down;
}

/**
 * Format data for chart
 * @param {Object} candle - Candle data
 * @returns {Object} Formatted candle for chart
 */
export function formatCandleForChart(candle) {
    return {
        time: candle.unix_timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
    };
}

/**
 * Format volume data for chart
 * @param {Object} candle - Candle data
 * @param {Object} colors - Color configuration
 * @returns {Object} Formatted volume for chart
 */
export function formatVolumeForChart(candle, colors = { up: '#10b981', down: '#ef4444' }) {
    return {
        time: candle.unix_timestamp,
        value: candle.volume || 0,
        color: (candle.close >= candle.open ? colors.up : colors.down) + '80',
    };
}