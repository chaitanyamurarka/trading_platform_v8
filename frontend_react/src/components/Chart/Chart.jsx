// src/components/Chart/Chart.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import useStore from '../../store';
import { useChart } from '../../hooks/useChart';
import { useChartData } from '../../hooks/useChartData';
import { useWebSocket } from '../../hooks/useWebSocket';
import { formatPrice, formatVolume } from '../../utils/formatters';
import styles from './Chart.module.css';

const Chart = () => {
  const chartContainerRef = useRef(null);
  const {
    showOHLCLegend,
    candleType,
    selectedSymbol,
    isLoadingHistoricalData,
    getCurrentChartData,
    getCurrentVolumeData,
  } = useStore();
  
  const [hoveredData, setHoveredData] = useState(null);
  const { createChart, destroyChart } = useChart(chartContainerRef);
  const { loadChartData } = useChartData();
  const { connectToLiveFeed } = useWebSocket();

  // Initialize chart
  useEffect(() => {
    if (chartContainerRef.current) {
      createChart();
      return () => {
        destroyChart();
      };
    }
  }, [createChart, destroyChart]);

  // Setup crosshair move listener
  useEffect(() => {
    const chart = useStore.getState().chart;
    const mainSeries = useStore.getState().mainSeries;
    const volumeSeries = useStore.getState().volumeSeries;

    if (!chart || !mainSeries) return;

    const handleCrosshairMove = (param) => {
      if (!param.time || !param.seriesPrices || param.seriesPrices.size === 0) {
        // Show latest values
        const chartData = getCurrentChartData();
        const volumeData = getCurrentVolumeData();
        if (chartData.length > 0) {
          const latestPrice = chartData[chartData.length - 1];
          const latestVolume = volumeData[volumeData.length - 1];
          setHoveredData({
            price: latestPrice,
            volume: latestVolume,
            isLatest: true
          });
        }
        return;
      }

      const priceData = param.seriesPrices.get(mainSeries);
      if (!priceData) return;

      let volumeDataForLegend = null;
      const rawVolumeValue = volumeSeries ? param.seriesPrices.get(volumeSeries) : undefined;

      if (rawVolumeValue !== undefined) {
        volumeDataForLegend = { value: rawVolumeValue };
      } else if (priceData.time) {
        const volumeArray = getCurrentVolumeData();
        const correspondingVolume = volumeArray.find(p => p.time === priceData.time);
        if (correspondingVolume) {
          volumeDataForLegend = { value: correspondingVolume.value };
        }
      }

      setHoveredData({
        price: priceData,
        volume: volumeDataForLegend,
        isLatest: false
      });
    };

    chart.subscribeCrosshairMove(handleCrosshairMove);

    return () => {
      chart.unsubscribeCrosshairMove(handleCrosshairMove);
    };
  }, [getCurrentChartData, getCurrentVolumeData]);

  // Setup infinite scroll
  useEffect(() => {
    const chart = useStore.getState().chart;
    if (!chart) return;

    const handleVisibleRangeChange = (newRange) => {
      if (newRange && newRange.from <= 10 && !useStore.getState().currentlyFetching) {
        // Trigger loading more data based on current chart type
        // This would be handled by the data loading hook
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    };
  }, []);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      const chart = useStore.getState().chart;
      if (chart && chartContainerRef.current) {
        chart.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderDataLegend = () => {
    if (!showOHLCLegend || !hoveredData?.price) return null;

    const { price, volume } = hoveredData;
    const candleTypeLabel = candleType === 'heikin_ashi' ? 'HA' : 'Regular';
    const isBullish = price.close >= price.open;
    const changeColor = isBullish ? '#26a69a' : '#ef5350';
    const change = price.close - price.open;
    const changePercent = price.open !== 0 ? (change / price.open) * 100 : 0;

    return (
      <div id="data-legend" className={styles.dataLegend}>
        <div className="space-y-1">
          <div className="font-bold text-sm">
            {selectedSymbol} <span className="text-xs text-blue-400">{candleTypeLabel}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>O: <span className="font-mono">{formatPrice(price.open)}</span></span>
            <span>H: <span className="font-mono">{formatPrice(price.high)}</span></span>
            <span>L: <span className="font-mono">{formatPrice(price.low)}</span></span>
            <span>C: <span className="font-mono">{formatPrice(price.close)}</span></span>
            <span>Vol: <span className="font-mono">{formatVolume(volume?.value)}</span></span>
            <span style={{ color: changeColor }}>
              Δ: {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl rounded-box flex-grow relative h-full flex-1">
      {renderDataLegend()}
      <div className={styles.chartWrapper}>
        <div id="chartContainer" ref={chartContainerRef} className={styles.chartContainer}>
          {isLoadingHistoricalData && (
            <div id="loadingIndicator" className={styles.loadingIndicator}>
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chart;