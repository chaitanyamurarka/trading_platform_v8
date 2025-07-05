// src/store/index.js
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useStore = create(devtools((set, get) => ({
  // Chart State
  chart: null,
  mainSeries: null,
  volumeSeries: null,
  
  // Session State
  sessionToken: null,
  heartbeatIntervalId: null,
  
  // UI State
  showOHLCLegend: true,
  candleType: 'regular', // 'regular', 'heikin_ashi', 'tick'
  chartType: 'candlestick',
  interval: '1m',
  timezone: 'America/New_York',
  selectedSymbol: '',
  selectedExchange: 'NASDAQ',
  isLive: false,
  isLoadingHistoricalData: false,
  currentlyFetching: false,
  
  // Data State
  chartRequestId: null,
  allChartData: [],
  allVolumeData: [],
  chartCurrentOffset: 0,
  allDataLoaded: false,
  
  // Heikin Ashi Data
  heikinAshiRequestId: null,
  allHeikinAshiData: [],
  allHeikinAshiVolumeData: [],
  heikinAshiCurrentOffset: 0,
  allHeikinAshiDataLoaded: false,
  
  // Tick Data
  tickRequestId: null,
  allTickData: [],
  allTickVolumeData: [],
  tickCurrentOffset: 0,
  allTickDataLoaded: false,
  
  // Available Symbols
  availableSymbols: [],
  
  // Indicator State
  isIndicatorActive: false,
  activeIndicatorSymbol: null,
  regressionSettings: {
    length: 4,
    lookbackPeriods: [0, 1, 2, 3, 4, 5],
    timeframes: ['10s', '30s', '1m', '5m']
  },
  regressionResults: null,
  
  // WebSocket State
  websocketMessageBuffer: [],
  
  // Chart Settings
  chartSettings: {
    gridColor: '#e0e0e0',
    watermarkText: 'My Trading Platform',
    upColor: '#10b981',
    downColor: '#ef4444',
    wickUpColor: '#10b981',
    wickDownColor: '#ef4444',
    volUpColor: '#10b981',
    volDownColor: '#ef4444',
    disableWicks: false,
  },
  
  // Actions
  setChart: (chart) => set({ chart }),
  setMainSeries: (mainSeries) => set({ mainSeries }),
  setVolumeSeries: (volumeSeries) => set({ volumeSeries }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  setHeartbeatIntervalId: (heartbeatIntervalId) => set({ heartbeatIntervalId }),
  setCandleType: (candleType) => set({ candleType }),
  setChartType: (chartType) => set({ chartType }),
  setInterval: (interval) => set({ interval }),
  setTimezone: (timezone) => set({ timezone }),
  setSelectedSymbol: (selectedSymbol) => set({ selectedSymbol }),
  setSelectedExchange: (selectedExchange) => set({ selectedExchange }),
  setIsLive: (isLive) => set({ isLive }),
  setIsLoadingHistoricalData: (isLoadingHistoricalData) => set({ isLoadingHistoricalData }),
  setAvailableSymbols: (availableSymbols) => set({ availableSymbols }),
  
  // Helper methods
  getCurrentChartData: () => {
    const state = get();
    if (state.candleType === 'heikin_ashi') {
      return state.allHeikinAshiData;
    } else if (state.candleType === 'tick') {
      return state.allTickData;
    } else {
      return state.allChartData;
    }
  },
  
  getCurrentVolumeData: () => {
    const state = get();
    if (state.candleType === 'heikin_ashi') {
      return state.allHeikinAshiVolumeData;
    } else if (state.candleType === 'tick') {
      return state.allTickVolumeData;
    } else {
      return state.allVolumeData;
    }
  },
  
  getCurrentRequestId: () => {
    const state = get();
    return state.candleType === 'heikin_ashi' ? state.heikinAshiRequestId : state.chartRequestId;
  },
  
  getCurrentOffset: () => {
    const state = get();
    return state.candleType === 'heikin_ashi' ? state.heikinAshiCurrentOffset : state.chartCurrentOffset;
  },
  
  isAllDataLoaded: () => {
    const state = get();
    return state.candleType === 'heikin_ashi' ? state.allHeikinAshiDataLoaded : state.allDataLoaded;
  },
  
  resetAllData: () => set({
    chartRequestId: null,
    allChartData: [],
    allVolumeData: [],
    chartCurrentOffset: 0,
    allDataLoaded: false,
    heikinAshiRequestId: null,
    allHeikinAshiData: [],
    allHeikinAshiVolumeData: [],
    heikinAshiCurrentOffset: 0,
    allHeikinAshiDataLoaded: false,
    tickRequestId: null,
    allTickData: [],
    allTickVolumeData: [],
    tickCurrentOffset: 0,
    allTickDataLoaded: false,
  }),
  
  resetIndicatorState: () => set({
    isIndicatorActive: false,
    activeIndicatorSymbol: null,
    regressionResults: null,
  }),
  
  processInitialData: (responseData, dataType) => {
    const chartFormattedData = responseData.candles.map(c => ({
      time: c.unix_timestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    }));

    const volumeFormattedData = responseData.candles.map(c => ({
      time: c.unix_timestamp,
      value: c.volume || 0,
      color: c.close >= c.open ? (get().chartSettings.volUpColor + '80') : (get().chartSettings.volDownColor + '80')
    }));
    
    const updates = {};
    
    switch (dataType) {
      case 'tick':
        updates.allTickData = chartFormattedData;
        updates.allTickVolumeData = volumeFormattedData;
        updates.tickRequestId = responseData.request_id;
        updates.tickCurrentOffset = responseData.offset;
        updates.allTickDataLoaded = !responseData.is_partial;
        break;
      case 'heikin_ashi':
        updates.allHeikinAshiData = chartFormattedData;
        updates.allHeikinAshiVolumeData = volumeFormattedData;
        updates.heikinAshiRequestId = responseData.request_id;
        updates.heikinAshiCurrentOffset = responseData.offset;
        updates.allHeikinAshiDataLoaded = !responseData.is_partial;
        break;
      default: // 'regular'
        updates.allChartData = chartFormattedData;
        updates.allVolumeData = volumeFormattedData;
        updates.chartRequestId = responseData.request_id;
        updates.chartCurrentOffset = responseData.offset;
        updates.allDataLoaded = !responseData.is_partial;
        break;
    }
    
    set(updates);
    
    // Update series data
    const { mainSeries, volumeSeries } = get();
    if (mainSeries) {
      mainSeries.setData(get().getCurrentChartData());
    }
    if (volumeSeries) {
      volumeSeries.setData(get().getCurrentVolumeData());
    }
    
    // Fit content
    const { chart } = get();
    if (chart) {
      chart.timeScale().fitContent();
    }
  },
  
  // Chart settings actions
  updateChartSettings: (settings) => set((state) => ({
    chartSettings: { ...state.chartSettings, ...settings }
  })),
  
  // WebSocket buffer
  addToWebSocketBuffer: (message) => set((state) => ({
    websocketMessageBuffer: [...state.websocketMessageBuffer, message]
  })),
  
  clearWebSocketBuffer: () => set({ websocketMessageBuffer: [] }),
})));

export default useStore;