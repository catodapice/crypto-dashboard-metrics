import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { satoshisToUSDT } from "../../utils/formatters";

type RangeOption = "all" | "1y" | "6m";

interface AccountBalanceChartProps {
  transactions: any[];
  range: RangeOption;
}

const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({ transactions, range }) => {
  const data = useMemo(() => {
    const mapped = transactions
      .map(tx => ({
        date: new Date(tx.timestamp),
        balance: satoshisToUSDT(tx.walletBalance || 0),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (mapped.length === 0) return [] as { date: string; balance: number }[];

    const lastDate = mapped[mapped.length - 1].date;
    let startDate = new Date(mapped[0].date);
    if (range === "1y") {
      startDate = new Date(lastDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if (range === "6m") {
      startDate = new Date(lastDate);
      startDate.setMonth(startDate.getMonth() - 6);
    }

    return mapped
      .filter(d => d.date >= startDate)
      .map(d => ({
        date: d.date.toLocaleDateString(),
        balance: d.balance,
      }));
  }, [transactions, range]);

  if (data.length === 0) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        No data
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="balance" stroke="#1976d2" fill="#90caf9" name="Balance" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default AccountBalanceChart;
