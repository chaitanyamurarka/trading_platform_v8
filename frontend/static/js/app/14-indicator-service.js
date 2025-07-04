// frontend/static/js/app/14-indicator-service.js
import { state } from './2-state.js';
import * as elements from './1-dom-elements.js';
import { fetchRegressionData } from '../api.js';
import { populateRegressionTable } from './4-ui-helpers.js';
import { showToast } from './4-ui-helpers.js';

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

    state.regressionSettings.timeframes = Array.from(elements.timeframesSelect.selectedOptions).map(opt => opt.value);

    if (state.regressionSettings.timeframes.length === 0) {
        showToast('Please select at least one timeframe.', 'error');
        return;
    }

    // 2. Build request body
    const requestBody = {
        symbol: elements.symbolSelect.value,
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
