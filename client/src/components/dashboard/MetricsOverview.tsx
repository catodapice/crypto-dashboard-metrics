import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

interface MetricsOverviewProps {
  metrics: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    profitFactor: number;
  };
}

const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
      <Box
        sx={{
          flex: "1 1 100%",
          minWidth: "250px",
          "@media (min-width:600px)": { flex: "1 1 45%" },
          "@media (min-width:900px)": { flex: "1 1 22%" },
        }}
      >
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              Total Trades
            </Typography>
            <ShowChartIcon color="primary" />
          </Box>
          <Typography component="p" variant="h4">
            {metrics.totalTrades}
          </Typography>
          <Typography color="textSecondary" sx={{ flex: 1 }}>
            All time
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          flex: "1 1 100%",
          minWidth: "250px",
          "@media (min-width:600px)": { flex: "1 1 45%" },
          "@media (min-width:900px)": { flex: "1 1 22%" },
        }}
      >
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              Win Rate
            </Typography>
            {metrics.winRate >= 50 ? (
              <TrendingUpIcon style={{ color: "green" }} />
            ) : (
              <TrendingDownIcon style={{ color: "red" }} />
            )}
          </Box>
          <Typography component="p" variant="h4">
            {metrics.winRate.toFixed(1)}%
          </Typography>
          <Typography color="textSecondary" sx={{ flex: 1 }}>
            {metrics.winRate >= 50 ? "Good performance" : "Needs improvement"}
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          flex: "1 1 100%",
          minWidth: "250px",
          "@media (min-width:600px)": { flex: "1 1 45%" },
          "@media (min-width:900px)": { flex: "1 1 22%" },
        }}
      >
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              Total P&L
            </Typography>
            {metrics.totalPnL >= 0 ? (
              <TrendingUpIcon style={{ color: "green" }} />
            ) : (
              <TrendingDownIcon style={{ color: "red" }} />
            )}
          </Box>
          <Typography component="p" variant="h4">
            ${metrics.totalPnL.toFixed(2)}
          </Typography>
          <Typography color="textSecondary" sx={{ flex: 1 }}>
            {metrics.totalPnL >= 0 ? "Profitable" : "In loss"}
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          flex: "1 1 100%",
          minWidth: "250px",
          "@media (min-width:600px)": { flex: "1 1 45%" },
          "@media (min-width:900px)": { flex: "1 1 22%" },
        }}
      >
        <Paper
          sx={{ p: 2, display: "flex", flexDirection: "column", height: 140 }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography color="textSecondary" variant="subtitle2" gutterBottom>
              Profit Factor
            </Typography>
            <AccountBalanceIcon color="primary" />
          </Box>
          <Typography component="p" variant="h4">
            {metrics.profitFactor.toFixed(2)}
          </Typography>
          <Typography color="textSecondary" sx={{ flex: 1 }}>
            {metrics.profitFactor >= 1.5
              ? "Excellent"
              : metrics.profitFactor >= 1
              ? "Good"
              : "Needs improvement"}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default MetricsOverview;
