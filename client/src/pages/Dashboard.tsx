import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Container,
} from "@mui/material";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import { bitmexService } from "../services/bitmexService";
import MetricsCard from "../components/cards/MetricsCard";
import PnLChart from "../components/charts/PnLChart";
import TradeDistributionChart from "../components/charts/TradeDistributionChart";
import RecentTrades from "../components/tables/RecentTrades";
import {
  processExecutionsIntoTrades,
  calculateTradingMetrics,
  generatePnLChartData,
  generateTradeDistribution,
} from "../utils/tradeProcessor";
import DebugPanel from "../components/DebugPanel";
import RealisedPnLCard from "../components/cards/RealisedPnLCard";
import RealisedPnLTable from "../components/tables/RealisedPnLTable";
import { satoshisToUSDT, formatCurrency } from "../utils/formatters";
import ConnectionStatus from "../components/ConnectionStatus";
import { mockData } from "../utils/mockData";

// Datos de ejemplo para cuando no hay datos reales
const mockDashboardData = {
  metrics: {
    totalTrades: 0,
    winRate: 0,
    totalPnL: 0,
    profitFactor: 0,
  },
  pnlHistory: [],
  tradeDistribution: [],
  recentTrades: [],
};

const Dashboard = () => {
  // Estado para controlar la carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para almacenar datos del dashboard
  const [dashboardData, setDashboardData] = useState(mockDashboardData);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [debugData, setDebugData] = useState({
    rawExecutions: [] as any[],
    processedTrades: [] as any[],
    apiResponses: {} as Record<string, any>,
    pnlTransactions: [] as any[],
  });

  // Estado para las operaciones y métricas
  const [trades, setTrades] = useState<any[]>([]);
  const [metrics, setMetrics] = useState(mockDashboardData.metrics);
  const [pnlHistory, setPnlHistory] = useState<any[]>([]);
  const [tradeDistribution, setTradeDistribution] = useState<any[]>([]);
  const [pnlTransactions, setPnlTransactions] = useState<any[]>([]);
  const [totalRealisedPnL, setTotalRealisedPnL] = useState(0);

  // Estado para la conexión
  const [isConnected, setIsConnected] = useState(false);
  const [lastConnectionCheck, setLastConnectionCheck] = useState<Date | null>(
    null
  );

  // Estado para la búsqueda de transacciones
  const [txId, setTxId] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  // Efecto para cargar datos al montar el componente
  useEffect(() => {
    fetchData();
    checkConnection();

    // Verificar la conexión cada 30 segundos
    const connectionInterval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(connectionInterval);
    };
  }, []);

  // Función para cargar datos
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Objeto para almacenar datos de depuración
      const debug = {
        rawExecutions: [] as any[],
        processedTrades: [] as any[],
        apiResponses: {} as Record<string, any>,
        pnlTransactions: [] as any[],
      };

      // 1. Obtener saldo disponible
      try {
        const walletResponse = await axios.get(
          "http://localhost:5000/api/bitmex/wallet-alt"
        );

        if (
          walletResponse.data &&
          typeof walletResponse.data.amount === "number"
        ) {
          setAvailableBalance(walletResponse.data.amount);
          debug.apiResponses.wallet = walletResponse.data;
        }
      } catch (walletError) {
        console.error("Error fetching wallet:", walletError);
      }

      // 2. Obtener ejecuciones
      let executions: any[] = [];
      try {
        executions = await bitmexService.getExecutions();
        debug.rawExecutions = executions.slice(0, 10);
        debug.apiResponses.executions = {
          count: executions.length,
          first: executions[0],
          last: executions[executions.length - 1],
        };
      } catch (executionsError) {
        console.error("Error fetching executions:", executionsError);
        executions = mockData.executions;
      }

      // 3. Procesar ejecuciones en operaciones
      const processedTrades = processExecutionsIntoTrades(executions);
      setTrades(processedTrades);
      debug.processedTrades = processedTrades.slice(0, 10);

      // 4. Calcular métricas
      try {
        const calculatedMetrics = calculateTradingMetrics(processedTrades);
        setMetrics(calculatedMetrics);
      } catch (metricsError) {
        console.error("Error calculating metrics:", metricsError);
      }

      // 5. Generar datos para gráficos
      try {
        const pnlHistory = generatePnLChartData(processedTrades);
        setPnlHistory(pnlHistory);

        const tradeDistribution = generateTradeDistribution(processedTrades);
        setTradeDistribution(tradeDistribution);
      } catch (chartError) {
        console.error("Error generating chart data:", chartError);
      }

      // 6. Obtener historial de PnL realizado
      try {
        const pnlData = await bitmexService.getWalletHistoryWithPnL();
        setPnlTransactions(pnlData.transactions || []);
        setTotalRealisedPnL(pnlData.totalPnL || 0);
        debug.pnlTransactions = pnlData.transactions.slice(0, 10);
        debug.apiResponses.pnlTotal = pnlData.totalPnL;
      } catch (pnlError) {
        console.error("Error fetching realised PnL:", pnlError);
      }

      // Actualizar datos de depuración
      setDebugData(debug);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        "Error al cargar los datos del dashboard. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  // Función para buscar una transacción por ID
  const handleSearch = async () => {
    if (!txId) return;

    setSearching(true);
    setSearchResult(null);

    try {
      const result = await bitmexService.searchTransaction(txId);
      setSearchResult(result);
    } catch (error) {
      console.error("Error searching transaction:", error);
      setSearchResult({ error: "Error al buscar la transacción" });
    } finally {
      setSearching(false);
    }
  };

  // Función para verificar la conexión con el servidor
  const checkConnection = async () => {
    try {
      await axios.get("http://localhost:5000/api/health-check", {
        timeout: 3000,
      });
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    }
    setLastConnectionCheck(new Date());
  };

  // Convertir totalPnL de satoshis a USDT
  const formattedPnL = satoshisToUSDT(totalRealisedPnL);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Trading
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            {/* PnL Total Card */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                PnL Realizado Total
              </Typography>
              <Typography
                variant="h3"
                color={formattedPnL >= 0 ? "success.main" : "error.main"}
              >
                ${formatCurrency(formattedPnL)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {pnlTransactions.length} transacciones
              </Typography>
            </Paper>

            {/* Transactions Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Historial de PnL Realizado
              </Typography>
              {pnlTransactions.length > 0 ? (
                <RealisedPnLTable transactions={pnlTransactions} />
              ) : (
                <Typography variant="body1" sx={{ py: 2 }}>
                  No hay transacciones de PnL realizado para mostrar.
                </Typography>
              )}
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Dashboard;
