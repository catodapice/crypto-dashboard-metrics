import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TimeAnalysisChartProps {
  trades: any[];
  groupBy: "dayOfWeek" | "hourOfDay" | "day" | "week" | "month";
}

const TimeAnalysisChart: React.FC<TimeAnalysisChartProps> = ({
  trades,
  groupBy,
}) => {
  const chartData = useMemo(() => {
    if (groupBy === "dayOfWeek") {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      return days.map((day) => {
        const dayTrades = trades.filter((trade) => {
          const date = new Date(trade.entryDate);
          return days[date.getDay()] === day;
        });

        const winCount = dayTrades.filter((trade) => trade.pnl > 0).length;
        const totalPnL = dayTrades.reduce((sum, trade) => sum + trade.pnl, 0);

        return {
          name: day,
          trades: dayTrades.length,
          winRate: dayTrades.length ? (winCount / dayTrades.length) * 100 : 0,
          pnl: totalPnL,
        };
      });
    }

    if (groupBy === "hourOfDay") {
      return Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        const hourTrades = trades.filter((trade) => {
          const date = new Date(trade.entryDate);
          return date.getHours() === hour;
        });

        const winCount = hourTrades.filter((trade) => trade.pnl > 0).length;
        const totalPnL = hourTrades.reduce((sum, trade) => sum + trade.pnl, 0);

        return {
          name: `${hour}:00`,
          trades: hourTrades.length,
          winRate: hourTrades.length ? (winCount / hourTrades.length) * 100 : 0,
          pnl: totalPnL,
        };
      });
    }

    return [];
  }, [trades, groupBy]);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar
          yAxisId="left"
          dataKey="trades"
          fill="#8884d8"
          name="Number of Trades"
        />
        <Bar yAxisId="right" dataKey="pnl" fill="#82ca9d" name="Total P&L" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TimeAnalysisChart;
