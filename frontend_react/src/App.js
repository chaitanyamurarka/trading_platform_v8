// src/App.js
import React, { useEffect } from 'react';
import { ChartProvider } from './contexts/ChartContext';
import { SessionProvider } from './contexts/SessionContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ToastProvider } from './contexts/ToastContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Chart from './components/Chart';
import DrawingToolbar from './components/DrawingToolbar';
import RegressionTable from './components/RegressionTable';
import SettingsModal from './components/Modals/SettingsModal';
import IndicatorModal from './components/Modals/IndicatorModal';
import Toast from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { useResponsive } from './hooks/useResponsive';
import './styles/global.css';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isMobile } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <SessionProvider>
      <ChartProvider>
        <WebSocketProvider>
          <ToastProvider>
            <div className="bg-base-200">
              {/* Sidebar Overlay */}
              <div 
                id="sidebar-overlay" 
                className={`fixed inset-0 ${sidebarOpen && isMobile ? 'block' : 'hidden'} bg-black bg-opacity-50 z-30`}
                onClick={toggleSidebar}
              />

              <div className="flex h-screen">
                {/* Sidebar */}
                <Sidebar isOpen={sidebarOpen} />

                {/* Main Content */}
                <main id="main-content" className="flex-1 flex flex-col overflow-y-auto">
                  {/* Header */}
                  <Header 
                    onMenuToggle={toggleSidebar}
                    theme={theme}
                    onThemeToggle={toggleTheme}
                  />

                  {/* Chart Container */}
                  <div className="flex-1 p-1 flex flex-col min-h-[400px]">
                    <Chart />
                  </div>

                  {/* Drawing Toolbar */}
                  <DrawingToolbar />

                  {/* Regression Table */}
                  <RegressionTable />
                </main>
              </div>

              {/* Toast Container */}
              <Toast />

              {/* Modals */}
              <SettingsModal />
              <IndicatorModal />
            </div>
          </ToastProvider>
        </WebSocketProvider>
      </ChartProvider>
    </SessionProvider>
  );
}

export default App;