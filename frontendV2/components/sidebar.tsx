"use client";

import useTradingStore from "@/store/trading-store";

const Sidebar = () => {
  const {
    symbol,
    setSymbol,
    interval,
    setInterval,
    chartType,
    setChartType,
  } = useTradingStore();

  return (
    <aside className="w-64 bg-base-200 p-4">
      <h2 className="text-lg font-bold mb-4">Settings</h2>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Symbol</span>
        </label>
        <select
          className="select select-bordered"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        >
          <option>BTC/USD</option>
          <option>ETH/USD</option>
        </select>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Interval</span>
        </label>
        <select
          className="select select-bordered"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option>1m</option>
          <option>5m</option>
          <option>15m</option>
          <option>1h</option>
          <option>4h</option>
          <option>1d</option>
        </select>
      </div>
      <div className="form-control">
        <label className="label">
          <span className="label-text">Chart Type</span>
        </label>
        <select
          className="select select-bordered"
          value={chartType}
          onChange={(e) => setChartType(e.target.value)}
        >
          <option value="candlestick">Candlestick</option>
          <option value="bar">Bar</option>
          <option value="line">Line</option>
          <option value="area">Area</option>
        </select>
      </div>
    </aside>
  );
};

export default Sidebar;