// frontend/static/js/main.js
import { state }  from '../utils/state.js';
import { getDomElements } from '../utils/dom-elements.js';  
const elements = getDomElements();
import { getChartTheme } from '../utils/chart-options.js';  
import { syncSettingsInputs, updateThemeToggleIcon, setAutomaticDateTime } from '../utils/ui-helpers.js';
import { recreateMainSeries } from '../components/chart-drawing.js';
import { startSession } from '../services/session-manager.js';
import { initializeAllEventListeners } from '../utils/event-listeners.js';
import { responsiveHandler } from '../utils/responsive-handler.js';

function initializeNewChartObject() {
    if (state.mainChart) state.mainChart.remove();
    
    state.mainChart = LightweightCharts.createChart(elements.chartContainer, getChartTheme(localStorage.getItem('chartTheme') || 'light'));
    state.mainSeries = null;
    state.volumeSeries = null;
    
    setTimeout(() => responsiveHandler.forceResize(), 100);
    
    syncSettingsInputs();
    recreateMainSeries(elements.chartTypeSelect.value);
    
    state.volumeSeries = state.mainChart.addHistogramSeries({ priceFormat: { type: 'volume' }, priceScaleId: '' });
    state.mainChart.priceScale('').applyOptions({ scaleMargins: { top: 0.85, bottom: 0 } });
}

document.addEventListener('DOMContentLoaded', () => {
    // Basic UI setup
    const savedTheme = localStorage.getItem('chartTheme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggleIcon();
    setAutomaticDateTime();

    // Initialize the chart object
    initializeNewChartObject();

    // Setup all event listeners from the new modules
    initializeAllEventListeners();
    
    // Start the session, which will trigger the initial data load
    startSession();

    // The call to fetchAndPopulateSymbols() is removed from here.
});