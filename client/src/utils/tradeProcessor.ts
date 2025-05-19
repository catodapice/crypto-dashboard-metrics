// Función para procesar ejecuciones en operaciones
export const processExecutionsIntoTrades = (executions: any[]) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  // Agrupar ejecuciones por orderID
  const executionsByOrder: Record<string, any[]> = executions.reduce(
    (acc, exec) => {
      if (!acc[exec.orderID]) {
        acc[exec.orderID] = [];
      }
      acc[exec.orderID].push(exec);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Convertir grupos de ejecuciones en operaciones
  const trades = Object.values(executionsByOrder).map((orderExecs) => {
    // Ordenar ejecuciones por timestamp
    const sortedExecs = [...orderExecs].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const firstExec = sortedExecs[0];
    const lastExec = sortedExecs[sortedExecs.length - 1];

    // Calcular cantidad total y precio promedio
    const totalQty = sortedExecs.reduce((sum, exec) => sum + exec.orderQty, 0);
    const avgPrice =
      sortedExecs.reduce((sum, exec) => sum + exec.price * exec.orderQty, 0) /
      totalQty;

    return {
      orderID: firstExec.orderID,
      symbol: firstExec.symbol,
      side: firstExec.side,
      quantity: totalQty,
      price: avgPrice,
      timestamp: firstExec.timestamp,
      closeTimestamp: lastExec.timestamp,
      executions: sortedExecs,
    };
  });

  return trades;
};

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

  // Asegurarse de que cada operación tenga un valor de PnL
  const tradesWithPnL = trades.map((trade) => {
    if (trade.pnl !== undefined) return trade;

    // Si no tiene PnL, calcularlo basado en precio de entrada/salida y cantidad
    const entryValue = trade.price * trade.quantity;
    const exitValue = (trade.closePrice || trade.price) * trade.quantity;

    const pnl =
      trade.side === "Buy" ? exitValue - entryValue : entryValue - exitValue;

    return {
      ...trade,
      pnl,
    };
  });

  const totalTrades = tradesWithPnL.length;
  const winningTrades = tradesWithPnL.filter((trade) => trade.pnl > 0).length;
  const winRate = totalTrades > 0 ? winningTrades / totalTrades : 0;

  const totalPnL = tradesWithPnL.reduce(
    (sum, trade) => sum + (trade.pnl || 0),
    0
  );

  // Calcular factor de beneficio (ganancias brutas / pérdidas brutas)
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

// Función para generar datos de distribución de operaciones
export const generateTradeDistribution = (trades: any[]) => {
  if (!trades || trades.length === 0) {
    return [];
  }

  // Agrupar operaciones por símbolo
  const symbolGroups: Record<string, any[]> = trades.reduce((acc, trade) => {
    const symbol = trade.symbol;
    if (!acc[symbol]) {
      acc[symbol] = [];
    }
    acc[symbol].push(trade);
    return acc;
  }, {} as Record<string, any[]>);

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
