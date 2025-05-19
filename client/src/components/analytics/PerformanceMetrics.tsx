import React from "react";
import { Grid, Paper, Typography, Box, Divider } from "@mui/material";

interface Trade {
  id: string;
  symbol: string;
  type: "Long" | "Short";
  pnl: number;
  entryDate: string;
  exitDate?: string;
  // Otros campos...
}

interface PerformanceMetricsProps {
  trades: Trade[];
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ trades }) => {
  // Calcular métricas
  const totalTrades = trades.length;
  const winningTrades = trades.filter((trade) => trade.pnl > 0).length;
  const losingTrades = trades.filter((trade) => trade.pnl < 0).length;
  const breakEvenTrades = totalTrades - winningTrades - losingTrades;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalWinnings = trades
    .filter((trade) => trade.pnl > 0)
    .reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLosses = trades
    .filter((trade) => trade.pnl < 0)
    .reduce((sum, trade) => sum + trade.pnl, 0);

  const avgWin = winningTrades > 0 ? totalWinnings / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0;

  const profitFactor =
    Math.abs(totalLosses) > 0 ? Math.abs(totalWinnings / totalLosses) : 0;

  // Calcular drawdown
  let balance = 0;
  let peak = 0;
  let maxDrawdown = 0;

  trades.forEach((trade) => {
    balance += trade.pnl;

    if (balance > peak) {
      peak = balance;
    } else {
      const drawdown = peak - balance;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
  });

  // Calcular métricas por tipo (Long/Short)
  const longTrades = trades.filter((trade) => trade.type === "Long");
  const shortTrades = trades.filter((trade) => trade.type === "Short");

  const longWins = longTrades.filter((trade) => trade.pnl > 0).length;
  const shortWins = shortTrades.filter((trade) => trade.pnl > 0).length;

  const longWinRate =
    longTrades.length > 0 ? (longWins / longTrades.length) * 100 : 0;
  const shortWinRate =
    shortTrades.length > 0 ? (shortWins / shortTrades.length) * 100 : 0;

  const longPnL = longTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const shortPnL = shortTrades.reduce((sum, trade) => sum + trade.pnl, 0);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Performance Metrics
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        {/* Métricas generales */}
        <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            General
          </Typography>
          <Divider sx={{ my: 1 }} />

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Total Trades:</Typography>
            <Typography>{totalTrades}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Winning Trades:</Typography>
            <Typography>{winningTrades}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Losing Trades:</Typography>
            <Typography>{losingTrades}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Break-Even Trades:</Typography>
            <Typography>{breakEvenTrades}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Win Rate:</Typography>
            <Typography>{winRate.toFixed(1)}%</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Profit Factor:</Typography>
            <Typography>{profitFactor.toFixed(2)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Max Drawdown:</Typography>
            <Typography>${maxDrawdown.toFixed(2)}</Typography>
          </Box>
        </Box>

        {/* Métricas de ganancias/pérdidas */}
        <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Profit/Loss
          </Typography>
          <Divider sx={{ my: 1 }} />

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Total P&L:</Typography>
            <Typography
              color={
                totalPnL > 0
                  ? "success.main"
                  : totalPnL < 0
                  ? "error.main"
                  : "inherit"
              }
            >
              ${totalPnL.toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Total Winnings:</Typography>
            <Typography color="success.main">
              ${totalWinnings.toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Total Losses:</Typography>
            <Typography color="error.main">
              ${totalLosses.toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Average Win:</Typography>
            <Typography color="success.main">${avgWin.toFixed(2)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Average Loss:</Typography>
            <Typography color="error.main">${avgLoss.toFixed(2)}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Win/Loss Ratio:</Typography>
            <Typography>
              {avgLoss !== 0 ? Math.abs(avgWin / avgLoss).toFixed(2) : "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Métricas por tipo */}
        <Box sx={{ flex: "1 1 30%", minWidth: "250px" }}>
          <Typography variant="subtitle1" fontWeight="bold">
            By Type
          </Typography>
          <Divider sx={{ my: 1 }} />

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Long Trades:</Typography>
            <Typography>{longTrades.length}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Long Win Rate:</Typography>
            <Typography>{longWinRate.toFixed(1)}%</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Long P&L:</Typography>
            <Typography
              color={
                longPnL > 0
                  ? "success.main"
                  : longPnL < 0
                  ? "error.main"
                  : "inherit"
              }
            >
              ${longPnL.toFixed(2)}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Short Trades:</Typography>
            <Typography>{shortTrades.length}</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Short Win Rate:</Typography>
            <Typography>{shortWinRate.toFixed(1)}%</Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Short P&L:</Typography>
            <Typography
              color={
                shortPnL > 0
                  ? "success.main"
                  : shortPnL < 0
                  ? "error.main"
                  : "inherit"
              }
            >
              ${shortPnL.toFixed(2)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default PerformanceMetrics;
