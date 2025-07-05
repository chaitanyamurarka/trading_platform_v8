// src/hooks/useChart.js
import { useCallback, useEffect } from 'react';
import useStore from '../store';
import { getChartTheme, getSeriesOptions } from '../utils/chartOptions';

export const useChart = (containerRef) => {
  const {
    setChart,
    setMainSeries,
    setVolumeSeries,
    chartType,
    chartSettings,
  } = useStore();

  const createChart = useCallback(() => {
    if (!containerRef.current || !window.LightweightCharts) return;

    const theme = localStorage.getItem('chartTheme') || 'light';
    const chart = window.LightweightCharts.createChart(
      containerRef.current,
      getChartTheme(theme)
    );

    setChart(chart);

    // Create main series
    const seriesOptions = getSeriesOptions(chartSettings);
    let mainSeries;

    switch (chartType) {
      case 'bar':
        mainSeries = chart.addBarSeries(seriesOptions);
        break;
      case 'line':
        mainSeries = chart.addLineSeries({ color: seriesOptions.upColor });
        break;
      case 'area':
        mainSeries = chart.addAreaSeries({
          lineColor: seriesOptions.upColor,
          topColor: `${seriesOptions.upColor}66`,
          bottomColor: `${seriesOptions.upColor}00`,
        });
        break;
      default:
        mainSeries = chart.addCandlestickSeries(seriesOptions);
        break;
    }

    setMainSeries(mainSeries);

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });

    chart.priceScale('').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    setVolumeSeries(volumeSeries);

    return chart;
  }, [containerRef, chartType, chartSettings, setChart, setMainSeries, setVolumeSeries]);

  const destroyChart = useCallback(() => {
    const chart = useStore.getState().chart;
    if (chart) {
      chart.remove();
      setChart(null);
      setMainSeries(null);
      setVolumeSeries(null);
    }
  }, [setChart, setMainSeries, setVolumeSeries]);

  const recreateMainSeries = useCallback((type) => {
    const { chart, mainSeries, getCurrentChartData } = useStore.getState();
    
    if (!chart) return;

    // Remove existing series
    if (mainSeries) {
      chart.removeSeries(mainSeries);
    }

    // Create new series
    const seriesOptions = getSeriesOptions(chartSettings);
    let newSeries;

    switch (type) {
      case 'bar':
        newSeries = chart.addBarSeries(seriesOptions);
        break;
      case 'line':
        newSeries = chart.addLineSeries({ color: seriesOptions.upColor });
        break;
      case 'area':
        newSeries = chart.addAreaSeries({
          lineColor: seriesOptions.upColor,
          topColor: `${seriesOptions.upColor}66`,
          bottomColor: `${seriesOptions.upColor}00`,
        });
        break;
      default:
        newSeries = chart.addCandlestickSeries(seriesOptions);
        break;
    }

    setMainSeries(newSeries);

    // Restore data
    const currentData = getCurrentChartData();
    if (currentData.length > 0) {
      newSeries.setData(currentData);
    }
  }, [chartSettings, setMainSeries]);

  return {
    createChart,
    destroyChart,
    recreateMainSeries,
  };
};

// src/hooks/useChartData.js
import { useCallback, useState } from 'react';
import useStore from '../store';
import api, { buildDataRequestParams, handleAPIError } from '../api';
import { useToast } from './useToast';
import { useWebSocket } from './useWebSocket';

export const useChartData = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { connectToLiveFeed, disconnectFromAllFeeds } = useWebSocket();
  
  const {
    sessionToken,
    selectedExchange,
    selectedSymbol,
    interval,
    timezone,
    candleType,
    isLive,
    setIsLoadingHistoricalData,
    resetAllData,
    processInitialData,
    setCurrentlyFetching,
  } = useStore();

  const loadChartData = useCallback(async () => {
    if (!sessionToken || !selectedSymbol) return;

    const isTickChart = interval.includes('tick');
    const actualCandleType = isTickChart ? 'tick' : candleType;

    // Reset data and disconnect websockets
    resetAllData();
    disconnectFromAllFeeds();

    setIsLoadingHistoricalData(true);
    setLoading(true);

    try {
      // Get date inputs from the DOM (in React, these would be controlled components)
      const startTime = document.getElementById('start_time')?.value;
      const endTime = document.getElementById('end_time')?.value;

      const params = buildDataRequestParams(
        sessionToken,
        selectedExchange,
        selectedSymbol,
        interval,
        startTime,
        endTime,
        timezone
      );

      let responseData;

      // Fetch initial data based on type
      if (isTickChart) {
        responseData = await api.tickData.getTickData(params);
      } else if (actualCandleType === 'heikin_ashi') {
        responseData = await api.heikinAshi.getHeikinAshiData(params);
      } else {
        responseData = await api.historicalData.getHistoricalData(params);
      }

      if (!responseData || !responseData.candles || responseData.candles.length === 0) {
        showToast(responseData?.message || 'No data found for the selection.', 'warning');
        const { mainSeries, volumeSeries } = useStore.getState();
        mainSeries?.setData([]);
        volumeSeries?.setData([]);
        return;
      }

      // Process and display the data
      processInitialData(responseData, actualCandleType);
      showToast(responseData.message, 'success');

      // Connect to live feed if enabled
      if (isLive) {
        connectToLiveFeed(actualCandleType);
      }

      // Apply autoscaling
      applyAutoscaling();

    } catch (error) {
      console.error('Failed to fetch initial chart data:', error);
      showToast(`Error: ${error.message}`, 'error');
      handleAPIError(error);
    } finally {
      setIsLoadingHistoricalData(false);
      setCurrentlyFetching(false);
      setLoading(false);
      
      // Process any buffered WebSocket messages
      processMessageBuffer();
    }
  }, [
    sessionToken,
    selectedExchange,
    selectedSymbol,
    interval,
    timezone,
    candleType,
    isLive,
    setIsLoadingHistoricalData,
    resetAllData,
    processInitialData,
    setCurrentlyFetching,
    showToast,
    connectToLiveFeed,
    disconnectFromAllFeeds,
  ]);

  const fetchAndPrependChunk = useCallback(async (type) => {
    const state = useStore.getState();
    
    // Check if we should fetch based on type
    if (type === 'regular' && (state.allDataLoaded || state.currentlyFetching || !state.chartRequestId)) {
      return;
    }
    if (type === 'heikin_ashi' && (state.allHeikinAshiDataLoaded || state.currentlyFetching || !state.heikinAshiRequestId)) {
      return;
    }
    if (type === 'tick' && (state.allTickDataLoaded || state.currentlyFetching || !state.tickRequestId)) {
      return;
    }

    setCurrentlyFetching(true);
    setLoading(true);

    try {
      let chunkData;
      
      if (type === 'tick') {
        chunkData = await api.tickData.getTickDataChunk(state.tickRequestId);
      } else if (type === 'heikin_ashi') {
        chunkData = await api.heikinAshi.getHeikinAshiDataChunk(state.heikinAshiRequestId);
      } else {
        chunkData = await api.historicalData.getHistoricalDataChunk(state.chartRequestId);
      }

      if (chunkData && chunkData.candles.length > 0) {
        // Process and prepend the data
        // This logic would be similar to the vanilla JS version
        showToast(`Loaded ${chunkData.candles.length} older candles`, 'success');
      }

    } catch (error) {
      console.error(`Failed to prepend ${type} data chunk:`, error);
      showToast(`Could not load older ${type} data.`, 'error');
    } finally {
      setCurrentlyFetching(false);
      setLoading(false);
    }
  }, [setCurrentlyFetching, showToast]);

  const applyAutoscaling = useCallback(() => {
    const { chart, getCurrentChartData } = useStore.getState();
    if (!chart) return;

    chart.priceScale().applyOptions({ autoScale: true });
    chart.timeScale().applyOptions({ rightOffset: 12 });

    const currentData = getCurrentChartData();
    if (currentData && currentData.length > 0) {
      const dataSize = currentData.length;
      chart.timeScale().setVisibleLogicalRange({
        from: Math.max(0, dataSize - 100),
        to: dataSize - 1,
      });
    }

    chart.timeScale().scrollToRealTime();
  }, []);

  const processMessageBuffer = useCallback(() => {
    const { websocketMessageBuffer, clearWebSocketBuffer } = useStore.getState();
    console.log(`Processing ${websocketMessageBuffer.length} buffered WebSocket messages.`);
    
    // Process messages here (implementation depends on WebSocket handler)
    
    clearWebSocketBuffer();
  }, []);

  return {
    loadChartData,
    fetchAndPrependChunk,
    loading,
  };
};