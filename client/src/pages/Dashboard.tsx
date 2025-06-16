import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Container,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { bitmexService } from "../services/bitmexService";
import RealisedPnLTable from "../components/tables/RealisedPnLTable";
import { formatCurrency, satoshisToUSDT } from "../utils/formatters";
import WalletPnLMetrics from "../components/analytics/WalletPnLMetrics";
import AccountBalanceChart from "../components/charts/AccountBalanceChart";
import AccountSelector from "../components/dashboard/AccountSelector";
import { useAccounts } from "../context/AccountContext";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pnlTransactions, setPnlTransactions] = useState<any[]>([]);
  const [totalRealisedPnL, setTotalRealisedPnL] = useState(0);
  const [breakevenThreshold, setBreakevenThreshold] = useState(0);
  const [balanceRange, setBalanceRange] = useState<"all" | "1y" | "6m">("all");
  const [tradesOnly, setTradesOnly] = useState(false);
  const { selectedAccount } = useAccounts();

  // Fetch data when an account is selected
  useEffect(() => {
    if (selectedAccount) {
      fetchData();
    }
  }, [selectedAccount]);

  const fetchData = async () => {
    // Prevent multiple simultaneous requests
    if (loading) {
      console.log("Already loading data, skipping request");
      return;
    }

    if (!bitmexService.hasCredentials()) {
      setError("No API credentials set. Please select an account first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get realized PnL history
      const pnlData = await bitmexService.getWalletHistoryWithPnL();
      setPnlTransactions(pnlData.transactions || []);
      setTotalRealisedPnL(pnlData.totalPnL || 0);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage =
        error.message ||
        "Error loading dashboard data. Please try again later.";
      setError(errorMessage);
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

        <AccountSelector />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        ) : !selectedAccount ? (
          <Alert severity="info" sx={{ my: 2 }}>
            Please add and select an API account above to view your trading
            data.
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
                onChange={(e) =>
                  setBreakevenThreshold(parseFloat(e.target.value))
                }
                helperText="Trades within this range count as break-even"
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
              <Box sx={{ mb: 2 }}>
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={balanceRange}
                  onChange={(_, val) => val && setBalanceRange(val)}
                >
                  <ToggleButton value="all">All Time</ToggleButton>
                  <ToggleButton value="1y">1 Year</ToggleButton>
                  <ToggleButton value="6m">6 Months</ToggleButton>
                </ToggleButtonGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tradesOnly}
                      onChange={(e) => setTradesOnly(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Trades Only"
                  sx={{ ml: 2 }}
                />
              </Box>
              <AccountBalanceChart
                transactions={pnlTransactions}
                range={balanceRange}
                tradesOnly={tradesOnly}
              />
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
