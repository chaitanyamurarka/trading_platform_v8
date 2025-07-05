// src/utils/constants.js
export const DATA_CHUNK_SIZE = 5000;
export const INITIAL_FETCH_LIMIT = 5000;

// src/utils/formatters.js
export function formatPrice(price, decimals = 2) {
  if (price === null || price === undefined) return 'N/A';
  return parseFloat(price).toFixed(decimals);
}

export function formatVolume(volume) {
  if (volume === null || volume === undefined) return 'N/A';
  const num = parseInt(volume);
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

// src/utils/dateHelpers.js
export function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDateInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}

export function getDatePartsInZone(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return Object.fromEntries(parts.map(p => [p.type, parseInt(p.value, 10)]));
}

// src/utils/chartOptions.js
export const getChartTheme = (theme) => {
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#333' : '#e0e0e0';
  const textColor = isDark ? '#fff' : '#333';

  return {
    layout: {
      background: { color: isDark ? '#1a1a1a' : '#ffffff' },
      textColor: textColor,
    },
    grid: {
      vertLines: { color: gridColor },
      horzLines: { color: gridColor },
    },
    crosshair: {
      mode: window.LightweightCharts?.CrosshairMode.Normal,
    },
    rightPriceScale: {
      borderColor: gridColor,
    },
    timeScale: {
      timeVisible: true,
      secondsVisible: true,
      borderColor: gridColor,
      shiftVisibleRangeOnNewBar: false,
    },
    watermark: {
      color: 'rgba(150, 150, 150, 0.2)',
      visible: true,
      text: 'My Trading Platform',
      fontSize: 48,
      horzAlign: 'center',
      vertAlign: 'center',
    },
  };
};

export const getSeriesOptions = (chartSettings) => {
  const { disableWicks, upColor, downColor, wickUpColor, wickDownColor } = chartSettings;

  const baseOptions = {
    upColor: upColor,
    downColor: downColor,
    borderDownColor: downColor,
    borderUpColor: upColor,
  };

  if (disableWicks) {
    baseOptions.wickUpColor = 'rgba(0,0,0,0)';
    baseOptions.wickDownColor = 'rgba(0,0,0,0)';
  } else {
    baseOptions.wickDownColor = wickDownColor;
    baseOptions.wickUpColor = wickUpColor;
  }

  return baseOptions;
};

// src/utils/chartHelpers.js
export function takeScreenshot(chart) {
  if (!chart) return;
  
  const canvas = chart.takeScreenshot();
  const link = document.createElement('a');
  link.href = canvas.toDataURL();
  link.download = `chart-screenshot-${new Date().toISOString()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}