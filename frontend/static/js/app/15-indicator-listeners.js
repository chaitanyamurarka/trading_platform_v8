import { getDomElements } from './1-dom-elements.js';

const elements = getDomElements();
import { state } from './2-state.js';
import { runRegressionAnalysis, removeRegressionAnalysis } from './14-indicator-service.js';

export function setupIndicatorListeners() {
    // Existing Apply button listener
    if (elements.indicatorApplyBtn) {
        elements.indicatorApplyBtn.addEventListener('click', runRegressionAnalysis);
    }

    // Modal Remove button listener
    if (elements.indicatorRemoveBtn) {
        elements.indicatorRemoveBtn.addEventListener('click', removeRegressionAnalysis);
    }

    // NEW: Table Remove button listener
    if (elements.removeRegressionBtn) {
        elements.removeRegressionBtn.addEventListener('click', removeRegressionAnalysis);
    }

    // NEW: Auto-update indicator when symbol changes
    if (elements.symbolSelect) {
        elements.symbolSelect.addEventListener('change', () => {
            if (state.isIndicatorActive && state.activeIndicatorSymbol !== elements.symbolSelect.value) {
                // Automatically re-run the analysis for the new symbol
                runRegressionAnalysis();
            }
        });
    }
}