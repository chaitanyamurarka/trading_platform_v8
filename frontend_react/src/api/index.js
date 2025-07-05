// src/api/index.js
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || `${window.location.protocol}//${window.location.hostname}:8000`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Session Management
export const sessionAPI = {
  initiateSession: async () => {
    const response = await api.get('/utils/session/initiate');
    return response.data;
  },

  sendHeartbeat: async (token) => {
    const response = await api.post('/utils/session/heartbeat', {
      session_token: token,
    });
    return response.data;
  },
};

// Symbol Management
export const symbolAPI = {
  fetchSymbols: async () => {
    const response = await api.get('/symbols');
    return response.data;
  },
};

// Historical Data
export const historicalDataAPI = {
  getHistoricalData: async (params) => {
    const response = await api.get('/historical/', { params });
    return response.data;
  },

  getHistoricalDataChunk: async (requestId, offset = 0, limit = 5000) => {
    const response = await api.get('/historical/chunk', {
      params: { request_id: requestId, offset, limit },
    });
    return response.data;
  },
};

// Heikin Ashi Data
export const heikinAshiAPI = {
  getHeikinAshiData: async (params) => {
    const response = await api.get('/heikin-ashi/', { params });
    return response.data;
  },

  getHeikinAshiDataChunk: async (requestId, offset = 0, limit = 5000) => {
    const response = await api.get('/heikin-ashi/chunk', {
      params: { request_id: requestId, offset, limit },
    });
    return response.data;
  },
};

// Tick Data
export const tickDataAPI = {
  getTickData: async (params) => {
    const response = await api.get('/tick/', { params });
    return response.data;
  },

  getTickDataChunk: async (requestId, limit = 5000) => {
    const response = await api.get('/tick/chunk', {
      params: { request_id: requestId, limit },
    });
    return response.data;
  },
};

// Regression Analysis
export const regressionAPI = {
  fetchRegressionData: async (requestBody) => {
    const response = await api.post('/regression', requestBody);
    return response.data;
  },
};

// Helper function to build data request parameters
export const buildDataRequestParams = (sessionToken, exchange, token, interval, startTime, endTime, timezone) => {
  return {
    session_token: sessionToken,
    exchange,
    token,
    interval,
    start_time: startTime,
    end_time: endTime,
    timezone,
  };
};

// Error handling wrapper
export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const errorMessage = error.response.data?.detail || error.response.statusText;
    throw new Error(errorMessage);
  } else if (error.request) {
    // Request made but no response
    throw new Error('Network error - server not responding');
  } else {
    // Something else happened
    throw error;
  }
};

// Export all APIs
export default {
  session: sessionAPI,
  symbols: symbolAPI,
  historicalData: historicalDataAPI,
  heikinAshi: heikinAshiAPI,
  tickData: tickDataAPI,
  regression: regressionAPI,
};