// src/hooks/useToast.js
import { useToastContext } from '../contexts/ToastContext';

export const useToast = () => {
  const { showToast, dismissToast } = useToastContext();
  return { showToast, dismissToast };
};

// src/hooks/useTheme.js
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('chartTheme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('chartTheme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return { theme, setTheme, toggleTheme };
};

// src/hooks/useResponsive.js
import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [breakpoint, setBreakpoint] = useState('desktop');

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const width = windowSize.width;
    if (width < 640) {
      setBreakpoint('mobile');
    } else if (width < 768) {
      setBreakpoint('tablet-portrait');
    } else if (width < 1024) {
      setBreakpoint('tablet-landscape');
    } else if (width < 1440) {
      setBreakpoint('desktop');
    } else {
      setBreakpoint('large-desktop');
    }
  }, [windowSize]);

  return {
    windowSize,
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet-portrait' || breakpoint === 'tablet-landscape',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'large-desktop',
  };
};

// src/hooks/useIndicators.js
import { useCallback } from 'react';
import useStore from '../store';
import api from '../api';
import { useToast } from './useToast';

export const useIndicators = () => {
  const {
    selectedSymbol,
    selectedExchange,
    regressionSettings,
    setIsIndicatorActive,
    setActiveIndicatorSymbol,
    resetIndicatorState,
  } = useStore();

  const { showToast } = useToast();

  const runRegressionAnalysis = useCallback(async (settings) => {
    const requestBody = {
      symbol: selectedSymbol,
      exchange: selectedExchange,
      regression_length: settings.length,
      lookback_periods: settings.lookbackPeriods,
      timeframes: settings.timeframes,
    };

    showToast('Running regression analysis...', 'info');

    try {
      const results = await api.regression.fetchRegressionData(requestBody);
      
      // Update store
      useStore.setState({
        regressionResults: results,
        isIndicatorActive: true,
        activeIndicatorSymbol: selectedSymbol,
      });

      showToast('Regression analysis complete.', 'success');
      return results;

    } catch (error) {
      console.error('Failed to run regression analysis:', error);
      showToast(error.message, 'error');
      throw error;
    }
  }, [selectedSymbol, selectedExchange, showToast]);

  const removeRegressionAnalysis = useCallback(() => {
    resetIndicatorState();
    showToast('Indicator removed.', 'info');
  }, [resetIndicatorState, showToast]);

  return {
    runRegressionAnalysis,
    removeRegressionAnalysis,
  };
};