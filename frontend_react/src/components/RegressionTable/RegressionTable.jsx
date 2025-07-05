// src/components/RegressionTable/RegressionTable.jsx
import React from 'react';
import useStore from '../../store';
import { useIndicators } from '../../hooks/useIndicators';
import styles from './RegressionTable.module.css';

const RegressionTable = () => {
  const { isIndicatorActive, regressionResults } = useStore();
  const { removeRegressionAnalysis } = useIndicators();

  if (!isIndicatorActive || !regressionResults) {
    return null;
  }

  const { request_params, regression_results } = regressionResults;

  if (!regression_results || regression_results.length === 0) {
    return null;
  }

  return (
    <div id="regression-table-container" className="p-2 bg-base-100">
      <div className="flex items-center gap-2 mb-2 px-2">
        <h3 className="font-bold text-lg">Linear Regression Analysis</h3>
        <button
          id="remove-regression-btn"
          className="btn btn-xs btn-ghost opacity-60 hover:opacity-100"
          title="Remove Analysis"
          onClick={removeRegressionAnalysis}
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
      <div className="overflow-x-auto rounded-lg border border-base-300">
        <table id="regression-table" className="table table-zebra table-sm w-full">
          <thead>
            <tr>
              <th>Sr. No.</th>
              <th>Timeframe</th>
              {request_params.lookback_periods.map(p => (
                <th key={p}>S[{p}]</th>
              ))}
              <th>R-Value (Avg)</th>
            </tr>
          </thead>
          <tbody>
            {regression_results.map((timeframeResult, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{timeframeResult.timeframe}</td>
                {request_params.lookback_periods.map(period => {
                  const result = timeframeResult.results[period.toString()];
                  return (
                    <td
                      key={period}
                      className={result ? (result.slope > 0 ? 'text-success' : 'text-error') : ''}
                    >
                      {result ? result.slope.toFixed(5) : 'N/A'}
                    </td>
                  );
                })}
                <td>
                  {(() => {
                    const values = request_params.lookback_periods
                      .map(p => timeframeResult.results[p.toString()])
                      .filter(r => r);
                    const avgRValue = values.length > 0
                      ? values.reduce((sum, r) => sum + Math.abs(r.r_value), 0) / values.length
                      : 0;
                    return avgRValue > 0 ? avgRValue.toFixed(4) : 'N/A';
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegressionTable;