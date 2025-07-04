import { useState, useEffect } from 'react';
import useTradingStore from '@/store/trading-store';

export const useChartData = () => {
  const [data, setData] = useState<any[]>([]);
  const { symbol, interval } = useTradingStore();

  useEffect(() => {
    const fetchData = async () => {
      // In a real application, you would fetch this data from your API
      const dummyData = Array.from({ length: 50 }).map((_, i) => ({
        time: (new Date().getTime() / 1000) - (50 - i) * 60,
        open: 100 + Math.random() * 10,
        high: 110 + Math.random() * 10,
        low: 90 + Math.random() * 10,
        close: 105 + Math.random() * 10,
      }));
      setData(dummyData);
    };

    fetchData();
  }, [symbol, interval]);

  return { data };
};