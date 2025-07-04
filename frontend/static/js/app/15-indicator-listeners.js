// frontend/static/js/app/15-indicator-listeners.js
import * as elements from './1-dom-elements.js';
import { runRegressionAnalysis, removeRegressionAnalysis } from './14-indicator-service.js';

/**
 * Sets up the event listeners for the indicator modal and its controls.
 */
export function setupIndicatorListeners() {
    // Ensure the button exists before adding a listener
    if (elements.indicatorApplyBtn) {
        elements.indicatorApplyBtn.addEventListener('click', runRegressionAnalysis);
    } else {
        console.error("Indicator 'Apply' button not found. Cannot set up listener.");
    }

    if (elements.indicatorRemoveBtn) {
        elements.indicatorRemoveBtn.addEventListener('click', removeRegressionAnalysis);
    } else {
        console.error("Indicator 'Remove' button not found. Cannot set up listener.");
    }
}