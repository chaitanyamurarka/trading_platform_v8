// src/contexts/SessionContext.js
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import useStore from '../store';
import api from '../api';
import { useToast } from '../hooks/useToast';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const { setSessionToken, setHeartbeatIntervalId, setAvailableSymbols } = useStore();
  const { showToast } = useToast();

  const startSession = useCallback(async () => {
    try {
      const sessionData = await api.session.initiateSession();
      setSessionToken(sessionData.session_token);
      showToast('Session started.', 'info');

      // Fetch symbols
      const symbols = await api.symbols.fetchSymbols();
      setAvailableSymbols(symbols);
      showToast(`Loaded ${symbols.length} symbols.`, 'success');

      // Start heartbeat
      const intervalId = setInterval(() => {
        const token = useStore.getState().sessionToken;
        if (token) {
          api.session.sendHeartbeat(token).catch(e => 
            console.error('Heartbeat failed', e)
          );
        }
      }, 60000); // every minute

      setHeartbeatIntervalId(intervalId);

    } catch (error) {
      console.error('Failed to initiate session:', error);
      showToast('Could not start a session. Please reload.', 'error');
    }
  }, [setSessionToken, setHeartbeatIntervalId, setAvailableSymbols, showToast]);

  useEffect(() => {
    startSession();

    return () => {
      const intervalId = useStore.getState().heartbeatIntervalId;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startSession]);

  return (
    <SessionContext.Provider value={{ startSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
};

// src/contexts/ChartContext.js
import React, { createContext, useContext } from 'react';

const ChartContext = createContext();

export const ChartProvider = ({ children }) => {
  // Chart-specific context logic would go here
  // For now, we're using Zustand for chart state
  
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

// src/contexts/WebSocketContext.js
import React, { createContext, useContext } from 'react';

const WebSocketContext = createContext();

export const WebSocketProvider = ({ children }) => {
  // WebSocket-specific context logic would go here
  // For now, we're using the useWebSocket hook directly
  
  return (
    <WebSocketContext.Provider value={{}}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within WebSocketProvider');
  }
  return context;
};

// src/contexts/ToastContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
};