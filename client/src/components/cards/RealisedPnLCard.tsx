import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { formatCurrency, satoshisToUSDT } from "../../utils/formatters";
import RealisedPnLTable from "../tables/RealisedPnLTable";

interface RealisedPnLCardProps {
  totalPnL: number;
  transactions: any[];
}

const RealisedPnLCard: React.FC<RealisedPnLCardProps> = ({
  totalPnL,
  transactions,
}) => {
  // Convertir totalPnL de satoshis a USDT
  const formattedPnL = satoshisToUSDT(totalPnL);

  return (
    <Paper sx={{ p: 2, mb: 3, height: "100%" }}>
      <Typography variant="h6" gutterBottom>
        PnL Realizado
      </Typography>

      <Typography
        variant="h4"
        color={formattedPnL >= 0 ? "success.main" : "error.main"}
        sx={{ mb: 2 }}
      >
        ${formatCurrency(formattedPnL)}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {transactions.length} transacciones
      </Typography>

      {transactions.length > 0 && (
        <Box sx={{ mt: 2, maxHeight: "200px", overflow: "auto" }}>
          <RealisedPnLTable transactions={transactions.slice(0, 5)} />
        </Box>
      )}
    </Paper>
  );
};

export default RealisedPnLCard;
