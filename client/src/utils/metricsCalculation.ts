// Función para calcular métricas de trading
export const calculateTradingMetrics = (trades: any[]) => {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      totalPnL: 0,
      profitFactor: 0,
    };
  }

  const totalTrades = trades.length;

  // Calcular PnL para cada operación
  const tradesWithPnL = trades.map((trade) => {
    // Simplificación: asumimos que el PnL es la diferencia entre el precio de entrada y salida
    const pnl =
      trade.side === "Buy"
        ? (trade.closePrice - trade.price) * trade.quantity
        : (trade.price - trade.closePrice) * trade.quantity;

    return {
      ...trade,
      pnl,
    };
  });

  // Contar operaciones ganadoras
  const winningTrades = tradesWithPnL.filter((trade) => trade.pnl > 0);
  const winRate = winningTrades.length / totalTrades;

  // Calcular PnL total
  const totalPnL = tradesWithPnL.reduce((sum, trade) => sum + trade.pnl, 0);

  // Calcular factor de beneficio
  const grossProfit = tradesWithPnL
    .filter((trade) => trade.pnl > 0)
    .reduce((sum, trade) => sum + trade.pnl, 0);

  const grossLoss = Math.abs(
    tradesWithPnL
      .filter((trade) => trade.pnl < 0)
      .reduce((sum, trade) => sum + trade.pnl, 0)
  );

  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  return {
    totalTrades,
    winRate,
    totalPnL,
    profitFactor,
  };
};
