// src/components/Modals/IndicatorModal.jsx
import React, { useState } from 'react';
import useStore from '../../store';
import { useIndicators } from '../../hooks/useIndicators';

const IndicatorModal = () => {
  const { regressionSettings } = useStore();
  const { runRegressionAnalysis } = useIndicators();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(regressionSettings);

  const handleApply = async () => {
    await runRegressionAnalysis(settings);
    setIsOpen(false);
  };

  const handleTimeframeChange = (timeframe, checked) => {
    setSettings(prev => ({
      ...prev,
      timeframes: checked
        ? [...prev.timeframes, timeframe]
        : prev.timeframes.filter(tf => tf !== timeframe)
    }));
  };

  const timeframeOptions = [
    { value: '10s', label: '10s' },
    { value: '30s', label: '30s' },
    { value: '45s', label: '45s' },
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '1h', label: '1h' },
  ];

  return (
    <dialog id="indicator_modal" className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg">Indicator Settings</h3>
        
        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Indicator</span>
            </label>
            <select className="select select-bordered select-sm" value="linear_regression">
              <option value="linear_regression">Linear Regression</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Regression Length</span>
            </label>
            <input
              type="number"
              value={settings.length}
              onChange={(e) => setSettings({ ...settings, length: parseInt(e.target.value) })}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Lookback Periods (comma-separated)</span>
            </label>
            <input
              type="text"
              value={settings.lookbackPeriods.join(', ')}
              onChange={(e) => setSettings({
                ...settings,
                lookbackPeriods: e.target.value.split(',').map(p => parseInt(p.trim())).filter(n => !isNaN(n))
              })}
              className="input input-bordered input-sm"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Timeframes</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeframeOptions.map(({ value, label }) => (
                <label key={value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={value}
                    checked={settings.timeframes.includes(value)}
                    onChange={(e) => handleTimeframeChange(value, e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button onClick={handleApply} className="btn btn-primary">
            Apply
          </button>
          <button onClick={() => setIsOpen(false)} className="btn">
            Close
          </button>
        </div>
      </div>
      
      <form method="dialog" className="modal-backdrop">
        <button onClick={() => setIsOpen(false)}>close</button>
      </form>
    </dialog>
  );
};

export default IndicatorModal;