import axios from "axios";
import { bitmexService } from "./bitmexService";

// Configuración base de axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para añadir token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores de autenticación (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Funciones para interactuar con la API

// Dashboard
export const fetchDashboardData = async () => {
  try {
    // Check if credentials are set before making API calls
    if (!bitmexService.hasCredentials()) {
      throw new Error(
        "API credentials not set. Please select an account first."
      );
    }

    // Obtener datos de diferentes endpoints
    const [positions, trades, walletHistory] = await Promise.all([
      bitmexService.getPositions(),
      bitmexService.getRecentTrades(),
      bitmexService.getWalletHistory(),
    ]);

    // Transformar los datos al formato que espera el dashboard
    const dashboardData = {
      metrics: calculateMetrics(trades, walletHistory),
      pnlHistory: transformWalletHistory(walletHistory),
      tradeDistribution: calculateTradeDistribution(trades),
      recentTrades: transformTrades(trades),
    };

    return dashboardData;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Funciones auxiliares para transformar los datos
function calculateMetrics(trades: any[], walletHistory: any[]) {
  // Implementar lógica para calcular métricas
  return {
    totalTrades: trades.length,
    winRate: calculateWinRate(trades),
    totalPnL: calculateTotalPnL(walletHistory),
    profitFactor: calculateProfitFactor(trades),
  };
}

function transformWalletHistory(walletHistory: any[]) {
  return walletHistory.map((entry) => ({
    date: entry.timestamp,
    pnl: entry.amount,
    cumulativePnl: entry.walletBalance,
  }));
}

function calculateTradeDistribution(trades: any[]) {
  // Implementar lógica para calcular la distribución
  const distribution = {
    longWins: 0,
    longLosses: 0,
    shortWins: 0,
    shortLosses: 0,
  };

  // ... lógica de cálculo ...

  return [
    { name: "Long Wins", value: distribution.longWins, color: "#4caf50" },
    { name: "Long Losses", value: distribution.longLosses, color: "#f44336" },
    { name: "Short Wins", value: distribution.shortWins, color: "#2196f3" },
    { name: "Short Losses", value: distribution.shortLosses, color: "#ff9800" },
  ];
}

function transformTrades(trades: any[]) {
  return trades.map((trade) => ({
    id: trade.trdMatchID,
    symbol: trade.symbol,
    type: trade.side === "Buy" ? "Long" : "Short",
    entryPrice: trade.price,
    exitPrice: null, // Necesitarás lógica adicional para determinar el precio de salida
    quantity: trade.size,
    entryDate: trade.timestamp,
    exitDate: null,
    pnl: trade.grossValue,
    status: "Closed", // Necesitarás lógica adicional para determinar el estado
  }));
}

// Funciones auxiliares adicionales
function calculateWinRate(trades: any[]) {
  // Implementar cálculo de win rate
  return 0;
}

function calculateTotalPnL(walletHistory: any[]) {
  // Implementar cálculo de PnL total
  return 0;
}

function calculateProfitFactor(trades: any[]) {
  // Implementar cálculo de profit factor
  return 0;
}

// Trades
export const fetchTrades = async (filters = {}) => {
  const response = await api.get("/trades", { params: filters });
  return response.data;
};

export const fetchTradeById = async (id) => {
  const response = await api.get(`/trades/${id}`);
  return response.data;
};

export const createTrade = async (tradeData) => {
  const response = await api.post("/trades", tradeData);
  return response.data;
};

export const updateTrade = async (id, tradeData) => {
  const response = await api.put(`/trades/${id}`, tradeData);
  return response.data;
};

export const deleteTrade = async (id) => {
  const response = await api.delete(`/trades/${id}`);
  return response.data;
};

// Analytics
export const fetchPerformanceMetrics = async (filters = {}) => {
  const response = await api.get("/analytics/performance", { params: filters });
  return response.data;
};

export const fetchTimeAnalysis = async (groupBy, filters = {}) => {
  const response = await api.get(`/analytics/time/${groupBy}`, {
    params: filters,
  });
  return response.data;
};

export const fetchDrawdownAnalysis = async (filters = {}) => {
  const response = await api.get("/analytics/drawdown", { params: filters });
  return response.data;
};

// BitMEX Integration
export const syncBitmexTrades = async (startDate, endDate) => {
  const response = await api.post("/bitmex/sync", { startDate, endDate });
  return response.data;
};

export const fetchBitmexApiStatus = async () => {
  const response = await api.get("/bitmex/status");
  return response.data;
};

// Auth
export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getCurrentUser = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateApiKeys = async (apiKeys) => {
  const response = await api.put("/auth/api-keys", apiKeys);
  return response.data;
};

export default api;
