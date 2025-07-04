"use client";

import { useRef, useEffect } from "react";
import { createChart } from "lightweight-charts";
import useTradingStore from "@/store/trading-store";
import { useChartData } from "@/hooks/useChartData";

const ChartContainer = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const series = useRef<any>(null);
  const { chartType } = useTradingStore();

  const { data } = useChartData();

  useEffect(() => {
    if (chartContainerRef.current && !chart.current) {
      chart.current = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: chartContainerRef.current.clientHeight,
        layout: {
          background: { color: "#ffffff" },
          textColor: "#191919",
        },
        grid: {
          vertLines: { color: "#e1e1e1" },
          horzLines: { color: "#e1e1e1" },
        },
      });
    }

    if (chart.current && series.current) {
        chart.current.removeSeries(series.current);
    }

    if (chart.current) {
        switch (chartType) {
            case "candlestick":
                series.current = chart.current.addCandlestickSeries();
                break;
            case "bar":
                series.current = chart.current.addBarSeries();
                break;
            case "line":
                series.current = chart.current.addLineSeries();
                break;
            case "area":
                series.current = chart.current.addAreaSeries();
                break;
        }
    }


    if (series.current && data) {
      series.current.setData(data);
    }

    const handleResize = () => {
      if (chart.current && chartContainerRef.current) {
        chart.current.resize(
          chartContainerRef.current.clientWidth,
          chartContainerRef.current.clientHeight
        );
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, chartType]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default ChartContainer;