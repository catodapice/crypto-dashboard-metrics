import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import TradesTable from "../components/tables/TradesTable";
import PerformanceMetrics from "../components/analytics/PerformanceMetrics";
import TimeAnalysisChart from "../components/charts/TimeAnalysisChart";
import { fetchTrades } from "../services/api";

const TradeAnalysis = () => {
  const [trades, setTrades] = useState([]);
  const [filters, setFilters] = useState({
    symbol: "",
    type: "",
    startDate: null,
    endDate: null,
    minPnl: "",
    maxPnl: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name) => (date) => {
    setFilters((prev) => ({ ...prev, [name]: date }));
  };

  const applyFilters = async () => {
    try {
      const filteredTrades = await fetchTrades(filters);
      setTrades(filteredTrades);
    } catch (error) {
      console.error("Error fetching trades", error);
    }
  };

  useEffect(() => {
    applyFilters();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Trade Analysis
      </Typography>

      {/* Filtros */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: "150px",
              "@media (min-width:600px)": { flex: "1 1 45%" },
              "@media (min-width:900px)": { flex: "1 1 15%" },
            }}
          >
            <TextField
              fullWidth
              label="Symbol"
              name="symbol"
              value={filters.symbol}
              onChange={handleFilterChange}
              select
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="XBTUSD">XBTUSD</MenuItem>
              <MenuItem value="ETHUSD">ETHUSD</MenuItem>
              {/* Más símbolos */}
            </TextField>
          </Box>

          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: "150px",
              "@media (min-width:600px)": { flex: "1 1 45%" },
              "@media (min-width:900px)": { flex: "1 1 15%" },
            }}
          >
            <TextField
              fullWidth
              label="Type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              select
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Long">Long</MenuItem>
              <MenuItem value="Short">Short</MenuItem>
            </TextField>
          </Box>

          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: "150px",
              "@media (min-width:600px)": { flex: "1 1 45%" },
              "@media (min-width:900px)": { flex: "1 1 15%" },
            }}
          >
            <DatePicker
              label="From Date"
              value={filters.startDate}
              onChange={handleDateChange("startDate")}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: "150px",
              "@media (min-width:600px)": { flex: "1 1 45%" },
              "@media (min-width:900px)": { flex: "1 1 15%" },
            }}
          >
            <DatePicker
              label="To Date"
              value={filters.endDate}
              onChange={handleDateChange("endDate")}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: "150px",
              "@media (min-width:600px)": { flex: "1 1 45%" },
              "@media (min-width:900px)": { flex: "1 1 15%" },
            }}
          >
            <TextField
              fullWidth
              label="Min PnL"
              name="minPnl"
              type="number"
              value={filters.minPnl}
              onChange={handleFilterChange}
            />
          </Box>

          <Box
            sx={{
              flex: "1 1 100%",
              minWidth: "150px",
              "@media (min-width:600px)": { flex: "1 1 45%" },
              "@media (min-width:900px)": { flex: "1 1 15%" },
            }}
          >
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Métricas de rendimiento */}
      <PerformanceMetrics trades={trades} />

      {/* Análisis por tiempo */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 3 }}>
        <Box
          sx={{
            flex: "1 1 100%",
            minWidth: "300px",
            "@media (min-width:900px)": { flex: "1 1 48%" },
          }}
        >
          <Card>
            <Box p={2}>
              <Typography variant="h6">Performance by Day of Week</Typography>
              <TimeAnalysisChart trades={trades} groupBy="dayOfWeek" />
            </Box>
          </Card>
        </Box>

        <Box
          sx={{
            flex: "1 1 100%",
            minWidth: "300px",
            "@media (min-width:900px)": { flex: "1 1 48%" },
          }}
        >
          <Card>
            <Box p={2}>
              <Typography variant="h6">Performance by Hour</Typography>
              <TimeAnalysisChart trades={trades} groupBy="hourOfDay" />
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Tabla de operaciones */}
      <Card>
        <Box p={2}>
          <Typography variant="h6">Trade History</Typography>
          <TradesTable trades={trades} />
        </Box>
      </Card>
    </Box>
  );
};

export default TradeAnalysis;
