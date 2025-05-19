import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
];

interface TradeDistributionItem {
  name: string;
  value: number;
  color: string;
}

interface TradeDistributionChartProps {
  data: TradeDistributionItem[];
}

const TradeDistributionChart: React.FC<TradeDistributionChartProps> = ({
  data,
}) => {
  // Si no hay datos, mostrar un mensaje
  if (!data || data.length === 0 || data.every((item) => item.value === 0)) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          No hay datos suficientes para mostrar la distribución
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} operaciones`, "Cantidad"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TradeDistributionChart;
