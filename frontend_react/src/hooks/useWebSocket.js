// src/hooks/useWebSocket.js
import { useCallback, useRef } from 'react';
import useStore from '../store';
import { useToast } from './useToast';

export const useWebSocket = () => {
  const liveDataSocketRef = useRef(null);
  const haLiveDataSocketRef = useRef(null);
  const { showToast } = useToast();

  const {
    selectedSymbol,
    interval,
    timezone,
    chartSettings,
    mainSeries,
    volumeSeries,
    isLoadingHistoricalData,
    addToWebSocketBuffer,
    getCurrentChartData,
    getCurrentVolumeData,
  } = useStore();

  // Handle live update for both regular and tick-based charts
  const handleLiveUpdate = useCallback((data) => {
    if (!data || !mainSeries) return;

    const { completed_bar, current_bar } = data;

    // Handle completed bar
    if (completed_bar) {
      const completedChartBar = {
        time: completed_bar.unix_timestamp,
        open: completed_bar.open,
        high: completed_bar.high,
        low: completed_bar.low,
        close: completed_bar.close,
      };
      mainSeries.update(completedChartBar);

      if (volumeSeries) {
        const volumeData = {
          time: completed_bar.unix_timestamp,
          value: completed_bar.volume,
          color: completed_bar.close >= completed_bar.open
            ? chartSettings.volUpColor + '80'
            : chartSettings.volDownColor + '80',
        };
        volumeSeries.update(volumeData);
      }
    }

    // Handle current bar
    if (current_bar) {
      const currentChartBar = {
        time: current_bar.unix_timestamp,
        open: current_bar.open,
        high: current_bar.high,
        low: current_bar.low,
        close: current_bar.close,
      };
      mainSeries.update(currentChartBar);

      if (volumeSeries) {
        const volumeData = {
          time: current_bar.unix_timestamp,
          value: current_bar.volume,
          color: current_bar.close >= current_bar.open
            ? chartSettings.volUpColor + '80'
            : chartSettings.volDownColor + '80',
        };
        volumeSeries.update(volumeData);
      }
    }
  }, [mainSeries, volumeSeries, chartSettings]);

  // Handle regular live data (including backfill)
  const handleRegularLiveData = useCallback((data) => {
    if (Array.isArray(data)) {
      // Handle backfill data
      if (data.length === 0) return;
      console.log(`Received backfill data with ${data.length} bars.`);

      const targetOhlcArray = getCurrentChartData();
      const targetVolumeArray = getCurrentVolumeData();

      const formattedBackfillBars = data.map(c => ({
        time: c.unix_timestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const formattedVolumeBars = data.map(c => ({
        time: c.unix_timestamp,
        value: c.volume,
        color: c.close >= c.open
          ? chartSettings.volUpColor + '80'
          : chartSettings.volDownColor + '80',
      }));

      const lastHistoricalTime = targetOhlcArray.length > 0
        ? targetOhlcArray[targetOhlcArray.length - 1].time
        : 0;

      const newOhlcBars = formattedBackfillBars.filter(d => d.time > lastHistoricalTime);
      const newVolumeBars = formattedVolumeBars.filter(d => d.time > lastHistoricalTime);

      if (newOhlcBars.length > 0) {
        targetOhlcArray.push(...newOhlcBars);
        targetVolumeArray.push(...newVolumeBars);
        mainSeries.setData(targetOhlcArray);
        volumeSeries.setData(targetVolumeArray);
      }
    } else {
      // Handle live update
      handleLiveUpdate(data);
    }
  }, [handleLiveUpdate, getCurrentChartData, getCurrentVolumeData, mainSeries, volumeSeries, chartSettings]);

  // Handle Heikin Ashi live data
  const handleLiveHeikinAshiData = useCallback((data) => {
    if (Array.isArray(data)) {
      // Handle HA backfill
      if (data.length === 0) return;
      
      const chartData = data.map(c => ({
        time: c.unix_timestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const volumeData = data.map(c => ({
        time: c.unix_timestamp,
        value: c.volume || 0,
        color: c.close >= c.open
          ? chartSettings.volUpColor + '80'
          : chartSettings.volDownColor + '80',
      }));

      mainSeries.setData(chartData);
      if (volumeSeries) volumeSeries.setData(volumeData);

      const chart = useStore.getState().chart;
      if (chart && chartData.length > 0) {
        const dataSize = chartData.length;
        chart.timeScale().setVisibleLogicalRange({
          from: Math.max(0, dataSize - 100),
          to: dataSize - 1,
        });
      }
    } else {
      // Handle live HA update
      handleLiveUpdate(data);
    }
  }, [handleLiveUpdate, mainSeries, volumeSeries, chartSettings]);

  // WebSocket message handlers
  const onRegularSocketMessage = useCallback((event) => {
    if (isLoadingHistoricalData) {
      console.log("Buffering WebSocket message.");
      addToWebSocketBuffer({ type: 'regular', data: event.data });
      return;
    }
    handleRegularLiveData(JSON.parse(event.data));
  }, [isLoadingHistoricalData, addToWebSocketBuffer, handleRegularLiveData]);

  const onHeikinAshiSocketMessage = useCallback((event) => {
    if (isLoadingHistoricalData) {
      console.log("Buffering HA WebSocket message.");
      addToWebSocketBuffer({ type: 'heikin_ashi', data: event.data });
      return;
    }
    handleLiveHeikinAshiData(JSON.parse(event.data));
  }, [isLoadingHistoricalData, addToWebSocketBuffer, handleLiveHeikinAshiData]);

  // Connect to live data feed
  const connectToLiveDataFeed = useCallback(() => {
    disconnectFromAllFeeds();
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsURL = `${wsProtocol}//${window.location.host}/ws/live/${encodeURIComponent(selectedSymbol)}/${interval}/${encodeURIComponent(timezone)}`;

    showToast(`Connecting to live feed for ${selectedSymbol}...`, 'info');
    
    liveDataSocketRef.current = new WebSocket(wsURL);

    liveDataSocketRef.current.onopen = () => {
      showToast(`Live feed connected for ${selectedSymbol}!`, 'success');
    };
    
    liveDataSocketRef.current.onmessage = onRegularSocketMessage;
    
    liveDataSocketRef.current.onclose = () => {
      console.log('Live data WebSocket closed.');
    };
    
    liveDataSocketRef.current.onerror = (error) => {
      console.error('Live data WebSocket error:', error);
      showToast('WebSocket connection error', 'error');
    };
  }, [selectedSymbol, interval, timezone, showToast, onRegularSocketMessage]);

  // Connect to Heikin Ashi live data
  const connectToLiveHeikinAshiData = useCallback(() => {
    disconnectFromAllFeeds();
    
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws-ha/live/${encodeURIComponent(selectedSymbol)}/${interval}/${encodeURIComponent(timezone)}`;

    showToast('Connecting to live Heikin Ashi data...', 'info');
    
    haLiveDataSocketRef.current = new WebSocket(wsUrl);

    haLiveDataSocketRef.current.onopen = () => {
      showToast('Connected to live Heikin Ashi data', 'success');
    };
    
    haLiveDataSocketRef.current.onmessage = onHeikinAshiSocketMessage;
    
    haLiveDataSocketRef.current.onclose = () => {
      console.log('HA live data WebSocket closed.');
    };
    
    haLiveDataSocketRef.current.onerror = (error) => {
      console.error('HA live data WebSocket error:', error);
      showToast('Heikin Ashi WebSocket connection error', 'error');
    };
  }, [selectedSymbol, interval, timezone, showToast, onHeikinAshiSocketMessage]);

  // Connect to appropriate live feed based on candle type
  const connectToLiveFeed = useCallback((candleType) => {
    if (candleType === 'heikin_ashi') {
      connectToLiveHeikinAshiData();
    } else {
      connectToLiveDataFeed();
    }
  }, [connectToLiveDataFeed, connectToLiveHeikinAshiData]);

  // Disconnect from all feeds
  const disconnectFromAllFeeds = useCallback(() => {
    if (liveDataSocketRef.current) {
      liveDataSocketRef.current.onclose = null;
      liveDataSocketRef.current.close();
      liveDataSocketRef.current = null;
    }
    
    if (haLiveDataSocketRef.current) {
      haLiveDataSocketRef.current.onclose = null;
      haLiveDataSocketRef.current.close();
      haLiveDataSocketRef.current = null;
    }
  }, []);

  return {
    connectToLiveFeed,
    connectToLiveDataFeed,
    connectToLiveHeikinAshiData,
    disconnectFromAllFeeds,
  };
};