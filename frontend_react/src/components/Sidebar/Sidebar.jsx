// src/components/Sidebar/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import { useChartData } from '../../hooks/useChartData';
import { formatDateForInput } from '../../utils/dateHelpers';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen }) => {
  const {
    selectedExchange,
    setSelectedExchange,
    selectedSymbol,
    setSelectedSymbol,
    interval,
    setInterval,
    availableSymbols,
  } = useStore();

  const { loadChartData } = useChartData();
  
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Initialize dates
  useEffect(() => {
    const { start, end } = getDefaultDateRange();
    setStartTime(formatDateForInput(start));
    setEndTime(formatDateForInput(end));
  }, []);

  const getDefaultDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return { start, end };
  };

  const handleExchangeChange = (e) => {
    setSelectedExchange(e.target.value);
    loadChartData();
  };

  const handleSymbolChange = (e) => {
    setSelectedSymbol(e.target.value);
    loadChartData();
  };

  const handleIntervalChange = (e) => {
    const newInterval = e.target.value;
    const candleType = useStore.getState().candleType;
    
    // Validation for Heikin Ashi
    if (newInterval.endsWith('tick') && candleType === 'heikin_ashi') {
      alert('Heikin Ashi is not compatible with Tick intervals.');
      return;
    }
    
    setInterval(newInterval);
    loadChartData();
  };

  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setStartTime(value);
    } else {
      setEndTime(value);
    }
    // Trigger reload on blur or enter key
  };

  const intervalOptions = [
    { group: 'Seconds', options: [
      { value: '1s', label: '1 Second' },
      { value: '5s', label: '5 Seconds' },
      { value: '10s', label: '10 Seconds' },
      { value: '15s', label: '15 Seconds' },
      { value: '30s', label: '30 Seconds' },
      { value: '45s', label: '45 Seconds' },
    ]},
    { group: 'Minutes', options: [
      { value: '1m', label: '1 Minute' },
      { value: '5m', label: '5 Minutes' },
      { value: '10m', label: '10 Minutes' },
      { value: '15m', label: '15 Minutes' },
      { value: '30m', label: '30 Minutes' },
      { value: '45m', label: '45 Minutes' },
    ]},
    { group: 'Hours & Days', options: [
      { value: '1h', label: '1 Hour' },
      { value: '1d', label: '1 Day' },
    ]},
  ];

  return (
    <aside
      id="sidebar"
      className={`${styles.sidebar} ${isOpen ? styles.open : ''} flex flex-col bg-base-100 px-4 py-8`}
    >
      <h2 className="text-3xl font-semibold text-primary">EigenKor</h2>
      
      <div className="mt-8">
        <div className="mt-4">
          {/* Exchange Select */}
          <div className="mb-4">
            <label htmlFor="exchange" className="text-sm">Exchange</label>
            <select
              id="exchange"
              className="select select-bordered select-sm w-full"
              value={selectedExchange}
              onChange={handleExchangeChange}
            >
              <option value="NASDAQ">NASDAQ</option>
            </select>
          </div>

          {/* Symbol Select */}
          <div className="mb-4">
            <label htmlFor="symbol" className="text-sm">Symbol</label>
            <select
              id="symbol"
              className="select select-bordered select-sm w-full"
              value={selectedSymbol}
              onChange={handleSymbolChange}
            >
              {availableSymbols.length === 0 ? (
                <option value="" disabled>Loading symbols...</option>
              ) : (
                availableSymbols.map((symbol) => (
                  <option key={symbol.symbol} value={symbol.symbol}>
                    {symbol.symbol}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Interval Select */}
          <div className="mb-4">
            <label htmlFor="interval" className="text-sm">Interval</label>
            <select
              id="interval"
              className="select select-bordered select-sm w-full"
              value={interval}
              onChange={handleIntervalChange}
            >
              {intervalOptions.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Start Time */}
          <div className="mb-4">
            <label htmlFor="start_time" className="text-sm">Start Time</label>
            <input
              id="start_time"
              type="datetime-local"
              className="input input-bordered input-sm w-full"
              value={startTime}
              onChange={(e) => handleDateChange('start', e.target.value)}
              onBlur={() => loadChartData()}
            />
          </div>

          {/* End Time */}
          <div className="mb-4">
            <label htmlFor="end_time" className="text-sm">End Time</label>
            <input
              id="end_time"
              type="datetime-local"
              className="input input-bordered input-sm w-full"
              value={endTime}
              onChange={(e) => handleDateChange('end', e.target.value)}
              onBlur={() => loadChartData()}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

// src/components/Sidebar/Sidebar.module.css
/*
.sidebar {
  width: var(--sidebar-width, 250px);
  transition: transform 0.3s ease-in-out;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 40;
  transform: translateX(-100%);
}

.sidebar.open {
  transform: translateX(0);
}

@media (min-width: 768px) {
  .sidebar {
    position: relative;
    transform: translateX(0);
  }
}
*/