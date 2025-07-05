// src/components/Header/Header.jsx
import React, { useState, useEffect } from 'react';
import useStore from '../../store';
import { useChartData } from '../../hooks/useChartData';
import { useChart } from '../../hooks/useChart';
import { useToast } from '../../hooks/useToast';
import { useWebSocket } from '../../hooks/useWebSocket';
import { takeScreenshot } from '../../utils/chartHelpers';
import styles from './Header.module.css';

const Header = ({ onMenuToggle, theme, onThemeToggle }) => {
  const {
    isLive,
    setIsLive,
    timezone,
    setTimezone,
    candleType,
    setCandleType,
    chartType,
    setChartType,
    interval,
    chart,
  } = useStore();

  const { loadChartData } = useChartData();
  const { recreateMainSeries } = useChart();
  const { showToast } = useToast();
  const { disconnectFromAllFeeds } = useWebSocket();
  
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [indicatorModalOpen, setIndicatorModalOpen] = useState(false);

  // Handle live toggle
  const handleLiveToggle = (e) => {
    const isChecked = e.target.checked;
    setIsLive(isChecked);
    
    if (isChecked) {
      // Set automatic date/time
      setAutomaticDateTime();
      loadChartData();
    } else {
      disconnectFromAllFeeds();
    }
  };

  // Handle timezone change
  const handleTimezoneChange = (e) => {
    if (isLive) {
      showToast('Timezone cannot be changed while Live Mode is active.', 'warning');
      e.target.value = timezone; // Revert
      return;
    }
    setTimezone(e.target.value);
    loadChartData();
  };

  // Handle candle type change
  const handleCandleTypeChange = (e) => {
    const newCandleType = e.target.value;
    const currentInterval = interval;

    // Validation
    if (newCandleType === 'heikin_ashi' && currentInterval.endsWith('tick')) {
      showToast('Heikin Ashi is not compatible with Tick intervals.', 'error');
      e.target.value = candleType === 'tick' ? 'regular' : candleType;
      return;
    }

    setCandleType(newCandleType);
    loadChartData();
  };

  // Handle chart type change
  const handleChartTypeChange = (e) => {
    setChartType(e.target.value);
    recreateMainSeries(e.target.value);
  };

  // Handle screenshot
  const handleScreenshot = () => {
    if (!chart) return;
    takeScreenshot(chart);
  };

  // Set automatic date/time for live mode
  const setAutomaticDateTime = () => {
    // This would update the date inputs in the sidebar
    // Implementation depends on how date state is managed
  };

  const timezones = [
    { value: 'Etc/UTC', label: 'UTC' },
    { value: 'Europe/London', label: 'London' },
    { value: 'America/New_York', label: 'New York' },
    { value: 'Asia/Kolkata', label: 'Kolkata' },
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-2 h-auto md:h-16 md:flex-nowrap md:py-0 bg-base-100 border-b border-base-300 sticky top-0 z-30">
        <div className="flex items-center justify-between h-auto md:h-16 bg-base-100 px-4 border-b border-base-300">
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 py-2">
            {/* Menu Toggle (Mobile) */}
            <button
              id="menu-toggle"
              className="btn btn-ghost -ml-2 md:hidden"
              onClick={onMenuToggle}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>

            {/* Live Toggle */}
            <div className="form-control flex flex-row items-center">
              <label htmlFor="live-toggle" className="label cursor-pointer py-0">
                <span className="label-text mr-2">Live</span>
                <input
                  type="checkbox"
                  id="live-toggle"
                  className="toggle toggle-sm toggle-primary"
                  checked={isLive}
                  onChange={handleLiveToggle}
                />
              </label>
            </div>

            {/* Timezone Select */}
            <select
              id="timezone"
              className="select select-bordered select-sm"
              value={timezone}
              onChange={handleTimezoneChange}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>

            {/* Candle Type Select */}
            <div className="form-control">
              <select
                id="candle-type-select"
                className="select select-bordered select-sm"
                value={candleType === 'tick' ? 'regular' : candleType}
                onChange={handleCandleTypeChange}
                disabled={interval.endsWith('tick')}
              >
                <option value="regular">Regular</option>
                <option value="heikin_ashi">Heikin Ashi</option>
              </select>
            </div>

            {/* Chart Type Select */}
            <select
              id="chart-type"
              className="select select-bordered select-sm"
              value={chartType}
              onChange={handleChartTypeChange}
            >
              <option value="candlestick">Candlestick</option>
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>

            {/* Action Buttons */}
            <button
              id="screenshot-btn"
              className="btn btn-sm btn-ghost"
              onClick={handleScreenshot}
            >
              <i className="fas fa-camera"></i>
            </button>
            
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setIndicatorModalOpen(true)}
            >
              <i className="fas fa-chart-bar"></i> Indicators
            </button>
            
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setSettingsModalOpen(true)}
            >
              <i className="fas fa-cog"></i>
            </button>
          </div>

          {/* Theme Toggle */}
          <label className="swap swap-rotate" id="theme-toggle">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={onThemeToggle}
            />
            <svg
              className="swap-on fill-current w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29l.71-.71A1,1,0,0,0,6.34,4.93l-.71.71A1,1,0,0,0,5.64,7.05ZM18.36,16.95a1,1,0,0,0-.7-1.71H16.91a1,1,0,0,0,0,2h.75a1,1,0,0,0,.7-1.71ZM12,18a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V19A1,1,0,0,0,12,18Zm5.36-1.64a1,1,0,0,0-.71.29l-.71.71a1,1,0,1,0,1.41,1.41l.71-.71A1,1,0,0,0,17.36,16.36ZM20,11H19a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Z"/>
            </svg>
            <svg
              className="swap-off fill-current w-6 h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
            </svg>
          </label>
        </div>
      </div>

      {/* Pass modal states to parent or render modals here */}
      {/* For now, we'll assume modals are rendered at the App level */}
    </>
  );
};

export default Header;