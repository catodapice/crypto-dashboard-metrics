import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { satoshisToUSDT } from "../../utils/formatters";

interface AccountBalanceChartProps {
  transactions: any[];
}

const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({ transactions }) => {
  const data = transactions
    .map(tx => ({
      date: new Date(tx.timestamp).toLocaleDateString(),
      balance: satoshisToUSDT(tx.walletBalance || 0),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (data.length === 0) {
    return <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="balance" stroke="#8884d8" name="Balance" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AccountBalanceChart;
