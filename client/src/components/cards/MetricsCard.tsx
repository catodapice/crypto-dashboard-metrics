import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { formatCurrency, formatPercentage } from "../../utils/formatters";

interface MetricsCardProps {
  metrics: {
    totalTrades: number;
    winRate: number;
    totalPnL: number;
    profitFactor: number;
  };
}

const MetricsCard: React.FC<MetricsCardProps> = ({ metrics }) => {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Métricas de Trading
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Box sx={{ width: "50%", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Operaciones
          </Typography>
          <Typography variant="h6">
            {metrics.totalTrades.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ width: "50%", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Win Rate
          </Typography>
          <Typography variant="h6">
            {formatPercentage(metrics.winRate)}
          </Typography>
        </Box>

        <Box sx={{ width: "50%", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            P&L Total
          </Typography>
          <Typography
            variant="h6"
            color={metrics.totalPnL >= 0 ? "success.main" : "error.main"}
          >
            ${formatCurrency(metrics.totalPnL)}
          </Typography>
        </Box>

        <Box sx={{ width: "50%", mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Factor de Beneficio
          </Typography>
          <Typography variant="h6">
            {isFinite(metrics.profitFactor)
              ? metrics.profitFactor.toFixed(2)
              : "N/A"}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default MetricsCard;
