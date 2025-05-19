// Función para generar datos para el gráfico de PnL
export const generatePnLChartData = (trades: any[]) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  // Ordenar operaciones por fecha
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Generar datos acumulativos para el gráfico
  let cumulativePnL = 0;
  return sortedTrades.map((trade) => {
    const pnl = trade.pnl || 0;
    cumulativePnL += pnl;

    return {
      date: new Date(trade.timestamp).toISOString().split("T")[0],
      pnl: pnl,
      cumulativePnL: cumulativePnL,
      symbol: trade.symbol,
    };
  });
};

// Interfaz para el objeto de grupo de operaciones
interface SymbolGroup {
  [key: string]: any[];
}

// Función para generar datos de distribución de operaciones
export const generateTradeDistribution = (trades: any[]) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  // Agrupar operaciones por símbolo
  const symbolGroups: SymbolGroup = trades.reduce((acc, trade) => {
    const symbol = trade.symbol;
    if (!acc[symbol]) {
      acc[symbol] = [];
    }
    acc[symbol].push(trade);
    return acc;
  }, {} as SymbolGroup);

  // Convertir grupos en datos para el gráfico
  return Object.entries(symbolGroups).map(([symbol, symbolTrades]) => {
    const totalTrades = symbolTrades.length;
    const winningTrades = symbolTrades.filter((trade) => trade.pnl > 0).length;
    const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

    return {
      symbol,
      totalTrades,
      winningTrades,
      losingTrades: totalTrades - winningTrades,
      winRate,
    };
  });
};
