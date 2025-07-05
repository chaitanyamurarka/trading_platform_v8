// src/components/Modals/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import useStore from '../../store';
import { useChart } from '../../hooks/useChart';
import styles from './Modals.module.css';

const SettingsModal = () => {
  const { 
    chart, 
    chartSettings, 
    updateChartSettings,
    showOHLCLegend,
    setShowOHLCLegend
  } = useStore();
  
  const { recreateMainSeries } = useChart();
  const [activeTab, setActiveTab] = useState('chart');
  const [localSettings, setLocalSettings] = useState(chartSettings);

  // Sync local settings with store when modal opens
  useEffect(() => {
    setLocalSettings(chartSettings);
  }, [chartSettings]);

  const handleColorChange = (setting, value) => {
    // Update local state first
    setLocalSettings(prev => ({ ...prev, [setting]: value }));
    
    // Update store
    updateChartSettings({ [setting]: value });
    
    // Apply changes to chart immediately
    if (chart) {
      switch (setting) {
        case 'gridColor':
          chart.applyOptions({
            grid: {
              vertLines: { color: value },
              horzLines: { color: value }
            }
          });
          break;
        case 'watermarkText':
          chart.applyOptions({
            watermark: { text: value }
          });
          break;
        case 'upColor':
        case 'downColor':
        case 'wickUpColor':
        case 'wickDownColor':
        case 'disableWicks':
          // Recreate series to apply color changes
          setTimeout(() => recreateMainSeries(useStore.getState().chartType), 0);
          break;
        case 'volUpColor':
        case 'volDownColor':
          // Update volume colors
          updateVolumeColors();
          break;
      }
    }
  };

  const updateVolumeColors = () => {
    const { volumeSeries, getCurrentVolumeData, getCurrentChartData } = useStore.getState();
    if (!volumeSeries) return;

    const volumeData = getCurrentVolumeData();
    const chartData = getCurrentChartData();
    
    if (volumeData.length === 0 || chartData.length === 0) return;

    const priceActionMap = new Map();
    chartData.forEach(priceData => {
      priceActionMap.set(priceData.time, priceData.close >= priceData.open);
    });

    const newVolumeData = volumeData.map(vol => ({
      ...vol,
      color: priceActionMap.get(vol.time) 
        ? localSettings.volUpColor + '80' 
        : localSettings.volDownColor + '80'
    }));

    volumeSeries.setData(newVolumeData);
  };

  const handleShowOHLCToggle = (checked) => {
    setShowOHLCLegend(checked);
    if (!checked) {
      // Hide the legend immediately
      const legendElement = document.getElementById('data-legend');
      if (legendElement) {
        legendElement.style.display = 'none';
      }
    }
  };

  const openModal = () => {
    const modal = document.getElementById('settings_modal');
    if (modal) modal.showModal();
  };

  const closeModal = () => {
    const modal = document.getElementById('settings_modal');
    if (modal) modal.close();
  };

  // Make openModal available globally for the Header component
  useEffect(() => {
    window.openSettingsModal = openModal;
    return () => {
      delete window.openSettingsModal;
    };
  }, []);

  return (
    <dialog id="settings_modal" className="modal">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg">Chart Settings</h3>
        
        <div className="tabs tabs-boxed my-4">
          
            className={`tab ${activeTab === 'chart' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('chart')}
          >
            Chart
          </a>
          
            className={`tab ${activeTab === 'series' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Series
          </a>
        </div>

        {/* Chart Settings Tab */}
        {activeTab === 'chart' && (
          <div className="space-y-4 tab-content">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Grid Color</span>
              </label>
              <input
                type="color"
                id="setting-grid-color"
                value={localSettings.gridColor}
                onChange={(e) => handleColorChange('gridColor', e.target.value)}
                className="input input-sm"
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Watermark Text</span>
              </label>
              <input
                type="text"
                id="setting-watermark-text"
                value={localSettings.watermarkText}
                onChange={(e) => handleColorChange('watermarkText', e.target.value)}
                className="input input-sm input-bordered"
              />
            </div>
          </div>
        )}

        {/* Series Settings Tab */}
        {activeTab === 'series' && (
          <div className="space-y-4 tab-content">
            <p className="font-bold">Candlestick/Bar Colors</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Up Color</span>
                </label>
                <input
                  type="color"
                  id="setting-up-color"
                  value={localSettings.upColor}
                  onChange={(e) => handleColorChange('upColor', e.target.value)}
                  className="input input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Down Color</span>
                </label>
                <input
                  type="color"
                  id="setting-down-color"
                  value={localSettings.downColor}
                  onChange={(e) => handleColorChange('downColor', e.target.value)}
                  className="input input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Wick Up</span>
                </label>
                <input
                  type="color"
                  id="setting-wick-up-color"
                  value={localSettings.wickUpColor}
                  onChange={(e) => handleColorChange('wickUpColor', e.target.value)}
                  className="input input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Wick Down</span>
                </label>
                <input
                  type="color"
                  id="setting-wick-down-color"
                  value={localSettings.wickDownColor}
                  onChange={(e) => handleColorChange('wickDownColor', e.target.value)}
                  className="input input-sm"
                />
              </div>
            </div>
            
            <div className="form-control">
              <label className="cursor-pointer inline-flex items-center gap-4">
                <span className="label-text">Disable Wicks</span>
                <input
                  type="checkbox"
                  id="setting-disable-wicks"
                  checked={localSettings.disableWicks}
                  onChange={(e) => handleColorChange('disableWicks', e.target.checked)}
                  className="toggle"
                />
              </label>
              
              <label className="cursor-pointer inline-flex items-center gap-4 mt-4">
                <span className="label-text">Show OHLCV on Hover</span>
                <input
                  type="checkbox"
                  id="setting-show-ohlc-legend"
                  checked={showOHLCLegend}
                  onChange={(e) => handleShowOHLCToggle(e.target.checked)}
                  className="toggle"
                />
              </label>
            </div>
            
            <div className="divider"></div>
            
            <p className="font-bold">Volume Colors</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Up Color</span>
                </label>
                <input
                  type="color"
                  id="setting-vol-up-color"
                  value={localSettings.volUpColor}
                  onChange={(e) => handleColorChange('volUpColor', e.target.value)}
                  className="input input-sm"
                />
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Down Color</span>
                </label>
                <input
                  type="color"
                  id="setting-vol-down-color"
                  value={localSettings.volDownColor}
                  onChange={(e) => handleColorChange('volDownColor', e.target.value)}
                  className="input input-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default SettingsModal;