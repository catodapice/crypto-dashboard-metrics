import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  TextField,
} from "@mui/material";
import { bitmexService } from "../services/bitmexService";
import RealisedPnLTable from "../components/tables/RealisedPnLTable";
import { formatCurrency, satoshisToUSDT } from "../utils/formatters";
import WalletPnLMetrics from "../components/analytics/WalletPnLMetrics";
import AccountBalanceChart from "../components/charts/AccountBalanceChart";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pnlTransactions, setPnlTransactions] = useState<any[]>([]);
  const [totalRealisedPnL, setTotalRealisedPnL] = useState(0);
  const [breakevenThreshold, setBreakevenThreshold] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get realized PnL history
      const pnlData = await bitmexService.getWalletHistoryWithPnL();
      setPnlTransactions(pnlData.transactions || []);
      setTotalRealisedPnL(pnlData.totalPnL || 0);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Error loading dashboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Convert totalPnL from satoshis to USDT
  const formattedPnL = satoshisToUSDT(totalRealisedPnL);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Trading Dashboard
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
                Total Realized PnL
              </Typography>
              <Typography
                variant="h3"
                color={formattedPnL >= 0 ? "success.main" : "error.main"}
              >
                ${formatCurrency(formattedPnL)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {pnlTransactions.length} transactions
              </Typography>
            </Paper>

            {/* Threshold input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                label="Breakeven Threshold (USDT)"
                type="number"
                value={breakevenThreshold}
                onChange={(e) => setBreakevenThreshold(parseFloat(e.target.value))}
              />
            </Box>

            {/* Metrics */}
            <WalletPnLMetrics
              transactions={pnlTransactions}
              threshold={breakevenThreshold}
            />

            {/* Balance chart */}
            <Paper sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Account Balance Evolution
              </Typography>
              <AccountBalanceChart transactions={pnlTransactions} />
            </Paper>

            {/* Transactions Table */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Realized PnL History
              </Typography>
              {pnlTransactions.length > 0 ? (
                <RealisedPnLTable transactions={pnlTransactions} />
              ) : (
                <Typography variant="body1" sx={{ py: 2 }}>
                  No realized PnL transactions to display.
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
