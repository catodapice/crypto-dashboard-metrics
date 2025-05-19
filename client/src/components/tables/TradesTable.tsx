import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip,
  IconButton,
  Collapse,
  Box,
  Typography,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { format } from "date-fns";

interface Trade {
  id: string;
  symbol: string;
  type: "Long" | "Short";
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  leverage: number;
  entryDate: string;
  exitDate: string;
  pnl: number;
  pnlPercentage: number;
  fees: number;
  status: "Open" | "Closed";
  notes?: string;
  stopLoss?: number;
  takeProfit?: number;
  strategy?: string;
}

interface TradesTableProps {
  trades: Trade[];
}

const Row: React.FC<{ trade: Trade }> = ({ trade }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{trade.symbol}</TableCell>
        <TableCell>
          <Chip
            label={trade.type}
            color={trade.type === "Long" ? "success" : "error"}
            size="small"
          />
        </TableCell>
        <TableCell>${trade.entryPrice.toFixed(2)}</TableCell>
        <TableCell>
          ${trade.exitPrice ? trade.exitPrice.toFixed(2) : "-"}
        </TableCell>
        <TableCell>{trade.quantity}</TableCell>
        <TableCell>
          {format(new Date(trade.entryDate), "yyyy-MM-dd HH:mm")}
        </TableCell>
        <TableCell>
          {trade.exitDate
            ? format(new Date(trade.exitDate), "yyyy-MM-dd HH:mm")
            : "-"}
        </TableCell>
        <TableCell
          style={{
            color: trade.pnl > 0 ? "green" : trade.pnl < 0 ? "red" : "inherit",
          }}
        >
          ${trade.pnl.toFixed(2)} ({trade.pnlPercentage.toFixed(2)}%)
        </TableCell>
        <TableCell>
          <Chip
            label={trade.status}
            color={trade.status === "Open" ? "primary" : "default"}
            size="small"
          />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Details
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Leverage</TableCell>
                    <TableCell>Fees</TableCell>
                    <TableCell>Stop Loss</TableCell>
                    <TableCell>Take Profit</TableCell>
                    <TableCell>Strategy</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{trade.leverage}x</TableCell>
                    <TableCell>${trade.fees.toFixed(2)}</TableCell>
                    <TableCell>
                      {trade.stopLoss ? `$${trade.stopLoss.toFixed(2)}` : "-"}
                    </TableCell>
                    <TableCell>
                      {trade.takeProfit
                        ? `$${trade.takeProfit.toFixed(2)}`
                        : "-"}
                    </TableCell>
                    <TableCell>{trade.strategy || "-"}</TableCell>
                    <TableCell>{trade.notes || "-"}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TradesTable: React.FC<TradesTableProps> = ({ trades }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Entry Price</TableCell>
              <TableCell>Exit Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Entry Date</TableCell>
              <TableCell>Exit Date</TableCell>
              <TableCell>P&L</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((trade) => (
                <Row key={trade.id} trade={trade} />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={trades.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default TradesTable;
