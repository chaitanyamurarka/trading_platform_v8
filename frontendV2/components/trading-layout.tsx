"use client";

import Header from "./header";
import Sidebar from "./sidebar";
import ChartContainer from "./chart-container";
import { useTheme } from "@/hooks/useTheme";

const TradingLayout = () => {
  const { theme } = useTheme();

  return (
    <div data-theme={theme} className="flex h-screen bg-base-100 text-base-content">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-4">
          <ChartContainer />
        </main>
      </div>
    </div>
  );
};

export default TradingLayout;