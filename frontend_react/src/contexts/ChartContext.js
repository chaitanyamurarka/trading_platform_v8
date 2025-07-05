// src/contexts/ChartContext.js
import React, { createContext, useContext } from 'react';

const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
  return (
    <ChartContext.Provider value={{}}>
      {children}
    </ChartContext.Provider>
  );
};

export const useChartContext = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChartContext must be used within ChartProvider');
  }
  return context;
};