// frontend/static/js/app/14-indicator-service.js
import { state } from '../utils/state.js';
import { getDomElements } from '../utils/dom-elements.js';

const elements = getDomElements();
import { fetchRegressionData } from './api.js';
import { populateRegressionTable, showToast } from '../utils/ui-helpers.js';

/**
 * Gathers settings from the UI, calls the regression API,
 * and populates the results table.
 */
export async function runRegressionAnalysis() {
    // 1. Update state from UI, with validation
    const regressionLength = parseInt(elements.regressionLengthInput.value, 10);
    if (isNaN(regressionLength) || regressionLength < 2) {
        showToast('Regression Length must be at least 2.', 'error');
        return;
    }
    state.regressionSettings.length = regressionLength;

    try {
        state.regressionSettings.lookbackPeriods = elements.lookbackPeriodsInput.value
            .split(',')
            .map(p => {
                const num = parseInt(p.trim(), 10);
                if (isNaN(num)) throw new Error();
                return num;
            });
    } catch (e) {
        showToast('Invalid format for Lookback Periods. Please use comma-separated numbers.', 'error');
        return;
    }

    // MODIFIED: Get selected timeframes from checkboxes
    state.regressionSettings.timeframes = 
        Array.from(elements.timeframesContainer.querySelectorAll('input[type="checkbox"]:checked'))
             .map(cb => cb.value);

    if (state.regressionSettings.timeframes.length === 0) {
        showToast('Please select at least one timeframe.', 'error');
        return;
    }

    // 2. Build request body
    const currentSymbol = elements.symbolSelect.value;
    const requestBody = {
        symbol: currentSymbol,
        exchange: elements.exchangeSelect.value,
        regression_length: state.regressionSettings.length,
        lookback_periods: state.regressionSettings.lookbackPeriods,
        timeframes: state.regressionSettings.timeframes,
    };

    showToast('Running regression analysis...', 'info');
    elements.indicatorApplyBtn.classList.add('loading');
    elements.indicatorApplyBtn.disabled = true;

    try {
        // 3. Call API
        const results = await fetchRegressionData(requestBody);
        state.regressionResults = results;
        state.isIndicatorActive = true;
        state.activeIndicatorSymbol = currentSymbol; // NEW: Store the symbol

        // 4. Populate table
        populateRegressionTable(results);
        showToast('Regression analysis complete.', 'success');

    } catch (error) {
        console.error('Failed to run regression analysis:', error);
        showToast(error.message, 'error');
        if (elements.regressionTableBody) {
            const colspan = (state.regressionSettings.lookbackPeriods?.length || 0) + 3;
            elements.regressionTableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-error">Error: ${error.message}</td></tr>`;
        }
    } finally {
        elements.indicatorApplyBtn.classList.remove('loading');
        elements.indicatorApplyBtn.disabled = false;
        if (elements.indicatorModal.open) {
            elements.indicatorModal.close();
        }
    }
}

/**
 * NEW: Removes the regression analysis from the chart.
 */
export function removeRegressionAnalysis() {
    state.resetIndicatorState();
    populateRegressionTable(null); // This will hide the table
    showToast('Indicator removed.', 'info');
    if (elements.indicatorModal.open) {
        elements.indicatorModal.close();
    }
}