import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { formatCurrency, satoshisToUSDT } from "../../utils/formatters";

interface RealisedPnLTableProps {
  transactions: any[];
}

const RealisedPnLTable: React.FC<RealisedPnLTableProps> = ({
  transactions,
}) => {
  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600, overflow: "auto" }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Instrumento</TableCell>
            <TableCell align="right">Monto</TableCell>
            <TableCell align="right">Fee</TableCell>
            <TableCell align="right">Neto</TableCell>
            <TableCell>ID de Transacción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((tx, index) => {
            // Convertir los valores de satoshis a USDT
            const amount = satoshisToUSDT(tx.amount || 0);
            const fee = satoshisToUSDT(tx.fee || 0);
            const net = amount - fee;

            return (
              <TableRow key={tx.transactID || index}>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                <TableCell>{tx.address || "Unknown"}</TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: amount >= 0 ? "success.main" : "error.main",
                    fontWeight: "bold",
                  }}
                >
                  ${formatCurrency(amount)}
                </TableCell>
                <TableCell align="right" sx={{ color: "error.main" }}>
                  ${formatCurrency(fee)}
                </TableCell>
                <TableCell
                  align="right"
                  sx={{
                    color: net >= 0 ? "success.main" : "error.main",
                    fontWeight: "bold",
                  }}
                >
                  ${formatCurrency(net)}
                </TableCell>
                <TableCell>{tx.transactID}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RealisedPnLTable;
