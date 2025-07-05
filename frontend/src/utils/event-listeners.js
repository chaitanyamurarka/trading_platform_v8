import { setupUiListeners } from './ui-listeners.js';
import { setupChartInteractionListeners, setupChartInfiniteScroll } from './chart-interaction-listeners.js';
import { setupDrawingToolbarListeners } from './drawing-toolbar-listeners.js';
import { setupIndicatorListeners } from './indicator-listeners.js'; // NEW

/**
 * Initializes all event listeners for the application.
 */
export function initializeAllEventListeners() {
    setupUiListeners();
    setupChartInteractionListeners();
    setupChartInfiniteScroll();
    setupDrawingToolbarListeners();
    setupIndicatorListeners(); // NEW
}
