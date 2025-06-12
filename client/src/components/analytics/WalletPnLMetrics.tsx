import React from "react";
import { Box, Typography, Divider, Paper } from "@mui/material";
import { satoshisToUSDT, formatCurrency } from "../../utils/formatters";

interface WalletPnLMetricsProps {
  transactions: any[];
  threshold?: number; // USDT value to consider as breakeven range
}

const WalletPnLMetrics: React.FC<WalletPnLMetricsProps> = ({ transactions, threshold = 0 }) => {
  const totals = transactions.map(tx => {
    const amount = satoshisToUSDT(tx.amount || 0);
    const fee = satoshisToUSDT(tx.fee || 0);
    return amount - fee;
  });

  const totalTrades = totals.length;
  const winningTrades = totals.filter(pnl => pnl > threshold).length;
  const losingTrades = totals.filter(pnl => pnl < -threshold).length;
  const breakEvenTrades = totalTrades - winningTrades - losingTrades;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalPnL = totals.reduce((sum, pnl) => sum + pnl, 0);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        PnL Metrics
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
        <Box sx={{ flex: "1 1 30%", minWidth: 200 }}>
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
        </Box>

        <Box sx={{ flex: "1 1 30%", minWidth: 200 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Profit / Loss
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Total P&L:</Typography>
            <Typography color={totalPnL >= 0 ? "success.main" : "error.main"}>
              ${formatCurrency(totalPnL)}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default WalletPnLMetrics;
