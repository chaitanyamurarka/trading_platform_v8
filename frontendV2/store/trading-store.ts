import { create } from 'zustand';

interface TradingState {
  symbol: string;
  setSymbol: (symbol: string) => void;
  interval: string;
  setInterval: (interval: string) => void;
  chartType: string;
  setChartType: (chartType: string) => void;
}

const useTradingStore = create<TradingState>((set) => ({
  symbol: 'BTC/USD',
  setSymbol: (symbol) => set({ symbol }),
  interval: '1m',
  setInterval: (interval) => set({ interval }),
  chartType: 'candlestick',
  setChartType: (chartType) => set({ chartType }),
}));

export default useTradingStore;