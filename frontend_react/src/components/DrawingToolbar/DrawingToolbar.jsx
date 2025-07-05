// src/components/DrawingToolbar/DrawingToolbar.jsx
import React, { useState } from 'react';
import useStore from '../../store';
import styles from './DrawingToolbar.module.css';

const DrawingToolbar = () => {
  const { chart, getCurrentChartData } = useStore();
  const [activeScaling, setActiveScaling] = useState('auto');

  const handleToolClick = (toolName) => {
    if (!chart) return;
    chart.setActiveLineTool(toolName);
  };

  const handleRemoveSelected = () => {
    if (!chart) return;
    chart.removeSelectedLineTools();
  };

  const handleRemoveAll = () => {
    if (!chart) return;
    chart.removeAllLineTools();
  };

  const handleAutoScale = () => {
    if (!chart) return;
    
    // Apply autoscale
    chart.priceScale().applyOptions({ autoScale: true });
    chart.timeScale().applyOptions({ rightOffset: 12 });

    // Set visible range to most recent 100 bars
    const currentData = getCurrentChartData();
    if (currentData && currentData.length > 0) {
      const dataSize = currentData.length;
      chart.timeScale().setVisibleLogicalRange({
        from: Math.max(0, dataSize - 100),
        to: dataSize - 1
      });
    }

    // Scroll to latest bar
    chart.timeScale().scrollToRealTime();
    setActiveScaling('auto');
  };

  const handleLinearScale = () => {
    if (!chart) return;
    
    chart.priceScale().applyOptions({ autoScale: false });
    chart.timeScale().applyOptions({ rightOffset: 0 });
    setActiveScaling('linear');
  };

  return (
    <div id="drawing-toolbar" className="flex items-center justify-center gap-2 p-2 bg-base-100">
      {/* Drawing Tools */}
      <button
        id="tool-trend-line"
        className="btn btn-sm btn-ghost"
        title="Trend Line"
        onClick={() => handleToolClick('TrendLine')}
      >
        <i className="fas fa-chart-line"></i>
      </button>
      
      <button
        id="tool-horizontal-line"
        className="btn btn-sm btn-ghost"
        title="Horizontal Line"
        onClick={() => handleToolClick('HorizontalLine')}
      >
        <i className="fas fa-ruler-horizontal"></i>
      </button>
      
      <button
        id="tool-fib-retracement"
        className="btn btn-sm btn-ghost"
        title="Fibonacci Retracement"
        onClick={() => handleToolClick('FibRetracement')}
      >
        <i className="fas fa-wave-square"></i>
      </button>
      
      <button
        id="tool-rectangle"
        className="btn btn-sm btn-ghost"
        title="Rectangle"
        onClick={() => handleToolClick('Rectangle')}
      >
        <i className="far fa-square"></i>
      </button>
      
      <button
        id="tool-brush"
        className="btn btn-sm btn-ghost"
        title="Brush"
        onClick={() => handleToolClick('Brush')}
      >
        <i className="fas fa-paint-brush"></i>
      </button>
      
      <div className="divider lg:divider-horizontal"></div>
      
      {/* Remove Tools */}
      <button
        id="tool-remove-selected"
        className="btn btn-sm btn-ghost text-error"
        title="Remove Selected"
        onClick={handleRemoveSelected}
      >
        <i className="fas fa-eraser"></i>
      </button>
      
      <button
        id="tool-remove-all"
        className="btn btn-sm btn-ghost text-error"
        title="Remove All"
        onClick={handleRemoveAll}
      >
        <i className="fas fa-trash-alt"></i>
      </button>
      
      <div className="divider lg:divider-horizontal"></div>
      
      {/* Scaling Buttons */}
      <div id="scaling-buttons-container">
        <div className="join">
          <button
            id="scaling-auto-btn"
            className={`btn btn-sm join-item ${activeScaling === 'auto' ? 'btn-active' : ''}`}
            title="Automatic Scaling"
            onClick={handleAutoScale}
          >
            Auto
          </button>
          <button
            id="scaling-linear-btn"
            className={`btn btn-sm join-item ${activeScaling === 'linear' ? 'btn-active' : ''}`}
            title="Linear Scaling"
            onClick={handleLinearScale}
          >
            Linear
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingToolbar;