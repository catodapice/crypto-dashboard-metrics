import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import { formatCurrency } from "../../utils/formatters";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface RecentTradesProps {
  trades: any[];
}

const RecentTrades: React.FC<RecentTradesProps> = ({ trades }) => {
  if (!trades || trades.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No hay operaciones recientes para mostrar
        </Typography>
      </Box>
    );
  }

  // Calcular PnL y comisiones para cada operación si no existen
  const processedTrades = trades.map((trade) => {
    let pnl = trade.pnl;
    let commission = trade.commission;

    // Si no tiene PnL, calcularlo
    if (pnl === undefined) {
      const entryValue = trade.price * trade.quantity;
      const exitValue = (trade.closePrice || trade.price) * trade.quantity;

      pnl =
        trade.side === "Buy" ? exitValue - entryValue : entryValue - exitValue;
    }

    // Si no tiene comisión, calcularla (0.075% es típico en BitMEX)
    if (commission === undefined) {
      commission = trade.quantity * trade.price * 0.00075;
    }

    return {
      ...trade,
      pnl,
      commission,
    };
  });

  return (
    <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Instrumento</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Fecha Entrada</TableCell>
            <TableCell>Fecha Salida</TableCell>
            <TableCell align="right">Precio Entrada</TableCell>
            <TableCell align="right">Precio Salida</TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">PnL</TableCell>
            <TableCell align="right">Comisiones</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {processedTrades.map((trade) => (
            <TableRow key={trade.orderID}>
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 1,
                      fontSize: "0.75rem",
                      color: "white",
                    }}
                  >
                    {trade.symbol.charAt(0)}
                  </Box>
                  {trade.symbol}
                </Box>
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: trade.side === "Buy" ? "success.main" : "error.main",
                  }}
                >
                  {trade.side === "Buy" ? (
                    <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                  )}
                  {trade.side}
                </Box>
              </TableCell>
              <TableCell>
                {new Date(trade.timestamp).toLocaleString()}
              </TableCell>
              <TableCell>
                {trade.closeTimestamp
                  ? new Date(trade.closeTimestamp).toLocaleString()
                  : "Abierta"}
              </TableCell>
              <TableCell align="right">
                ${formatCurrency(trade.price)}
              </TableCell>
              <TableCell align="right">
                {trade.closePrice
                  ? `$${formatCurrency(trade.closePrice)}`
                  : "N/A"}
              </TableCell>
              <TableCell align="right">
                {trade.quantity.toLocaleString()}
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  color:
                    trade.pnl > 0
                      ? "success.main"
                      : trade.pnl < 0
                      ? "error.main"
                      : "text.primary",
                }}
              >
                ${formatCurrency(trade.pnl)}
              </TableCell>
              <TableCell align="right">
                ${formatCurrency(trade.commission)}
              </TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: "inline-block",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor:
                      trade.closeTimestamp === undefined
                        ? "info.light"
                        : "success.light",
                    color:
                      trade.closeTimestamp === undefined
                        ? "info.dark"
                        : "success.dark",
                    fontSize: "0.75rem",
                  }}
                >
                  {trade.closeTimestamp === undefined ? "Abierta" : "Cerrada"}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RecentTrades;
