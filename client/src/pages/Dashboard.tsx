import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { bitmexService } from "../services/bitmexService";
import RealisedPnLTable from "../components/tables/RealisedPnLTable";
import { formatCurrency, satoshisToUSDT } from "../utils/formatters";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pnlTransactions, setPnlTransactions] = useState<any[]>([]);
  const [totalRealisedPnL, setTotalRealisedPnL] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Obtener historial de PnL realizado
      const pnlData = await bitmexService.getWalletHistoryWithPnL();
      setPnlTransactions(pnlData.transactions || []);
      setTotalRealisedPnL(pnlData.totalPnL || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        "Error al cargar los datos del dashboard. Por favor, intenta de nuevo más tarde."
      );
    } finally {
      setLoading(false);
    }
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
