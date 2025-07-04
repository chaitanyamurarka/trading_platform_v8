import { setupUiListeners } from './11-ui-listeners.js';
import { setupChartInteractionListeners, setupChartInfiniteScroll } from './12-chart-interaction-listeners.js';
import { setupDrawingToolbarListeners } from './13-drawing-toolbar-listeners.js';
import { setupIndicatorListeners } from './15-indicator-listeners.js'; // NEW

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
