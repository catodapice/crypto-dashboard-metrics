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
  tradesOnly?: boolean;
}

const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({
  transactions,
  range,
  tradesOnly = false,
}) => {
  const data = useMemo(() => {
    const sorted = [...transactions].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    let mapped: { date: Date; balance: number }[];

    if (tradesOnly) {
      let balance = 0;
      mapped = sorted.map((tx) => {
        balance += satoshisToUSDT((tx.amount || 0) - (tx.fee || 0));
        return { date: new Date(tx.timestamp), balance };
      });
    } else {
      mapped = sorted.map((tx) => ({
        date: new Date(tx.timestamp),
        balance: satoshisToUSDT(tx.walletBalance || 0),
      }));
    }

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
  }, [transactions, range, tradesOnly]);

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
