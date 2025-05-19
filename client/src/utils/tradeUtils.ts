// Función para agrupar operaciones por orderID
export const groupTradesByOrder = (trades) => {
  const orderMap = new Map();

  // Primero agrupamos todas las ejecuciones por orderID
  trades.forEach((trade) => {
    if (trade.orderID) {
      if (!orderMap.has(trade.orderID)) {
        orderMap.set(trade.orderID, []);
      }
      orderMap.get(trade.orderID).push(trade);
    } else if (trade.execType === "Funding") {
      // Los pagos de financiamiento no tienen orderID, los tratamos individualmente
      orderMap.set(`funding-${trade.execID}`, [trade]);
    } else {
      // Otras ejecuciones sin orderID
      orderMap.set(`exec-${trade.execID}`, [trade]);
    }
  });

  // Convertir el mapa a un array de operaciones agrupadas
  return Array.from(orderMap.values());
};

// Función para formatear una operación completa (grupo de ejecuciones)
export const formatCompleteTrade = (tradeGroup) => {
  if (!tradeGroup || tradeGroup.length === 0) {
    return null;
  }

  // Ordenar las ejecuciones por fecha
  const sortedTrades = [...tradeGroup].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstTrade = sortedTrades[0];
  const lastTrade = sortedTrades[sortedTrades.length - 1];

  // Calcular el PNL total - MODIFICADO para usar directamente el valor de realisedPnl
  let totalPnl = 0;
  sortedTrades.forEach((trade) => {
    // Para operaciones en USDT, no necesitamos convertir de satoshis
    if (trade.realisedPnl !== undefined) {
      // Si el valor es muy grande, probablemente ya está en la unidad correcta
      if (Math.abs(trade.realisedPnl) > 1) {
        totalPnl += trade.realisedPnl;
      } else {
        // De lo contrario, convertir de satoshis
        totalPnl += trade.realisedPnl / 100000000;
      }
    } else if (trade.execComm !== undefined) {
      // Las comisiones son negativas para el PNL
      totalPnl -= Math.abs(trade.execComm);
    }

    // También verificar si hay un campo "amount" directo
    if (trade.amount !== undefined) {
      totalPnl += trade.amount;
    }

    // Verificar si hay un campo específico para USDT
    if (trade.usdtAmount !== undefined) {
      totalPnl += trade.usdtAmount;
    }
  });

  // Calcular la cantidad total
  let totalQuantity = 0;
  sortedTrades.forEach((trade) => {
    if (trade.lastQty !== undefined) {
      totalQuantity += trade.lastQty;
    } else if (trade.orderQty !== undefined) {
      totalQuantity += trade.orderQty;
    }
  });

  // Determinar si la operación está cerrada
  const isClosed =
    lastTrade.ordStatus === "Filled" ||
    lastTrade.ordStatus === "Canceled" ||
    lastTrade.leavesQty === 0;

  return {
    id: firstTrade.orderID || firstTrade.execID,
    symbol: firstTrade.symbol,
    type: firstTrade.side === "Buy" ? "Long" : "Short",
    entryPrice: firstTrade.price || firstTrade.lastPx || 0,
    exitPrice: isClosed ? lastTrade.price || lastTrade.lastPx || 0 : null,
    quantity: totalQuantity,
    entryDate: firstTrade.timestamp,
    exitDate: isClosed ? lastTrade.timestamp : null,
    pnl: totalPnl,
    status: isClosed ? "Closed" : "Open",
  };
};

// Función original modificada para usar las nuevas funciones
export const formatBitmexTrade = (trade) => {
  // Valores predeterminados seguros para todos los campos
  const formattedTrade = {
    id: trade.execID || String(Date.now() + Math.random()),
    symbol: trade.symbol || "Unknown",
    type: trade.side === "Buy" ? "Long" : "Short",
    entryPrice: 0,
    exitPrice: null,
    quantity: 0,
    entryDate: new Date().toISOString(),
    exitDate: null,
    pnl: 0,
    status: "Closed",
  };

  // Asignar valores solo si existen
  if (trade.price !== undefined) formattedTrade.entryPrice = trade.price;
  else if (trade.lastPx !== undefined) formattedTrade.entryPrice = trade.lastPx;

  if (trade.orderQty !== undefined) formattedTrade.quantity = trade.orderQty;
  else if (trade.lastQty !== undefined) formattedTrade.quantity = trade.lastQty;

  // Manejar fechas
  if (trade.timestamp) {
    // Simplemente usar la fecha tal como viene
    formattedTrade.entryDate = trade.timestamp;
  }

  if (trade.realisedPnl !== undefined) {
    formattedTrade.pnl = trade.realisedPnl / 100000000;
  } else if (trade.execComm !== undefined) {
    formattedTrade.pnl = -trade.execComm / 100000000;
  }

  if (trade.ordStatus) formattedTrade.status = trade.ordStatus;

  return formattedTrade;
};

// Calcular la tasa de victorias
export const calculateWinRate = (trades) => {
  if (!trades || trades.length === 0) return 0;

  const winningTrades = trades.filter((trade) => trade.pnl > 0);
  return (winningTrades.length / trades.length) * 100;
};

// Calcular el PNL total
export const calculateTotalPnL = (trades) => {
  if (!trades || trades.length === 0) return 0;

  return trades.reduce((total, trade) => total + (trade.pnl || 0), 0);
};

// Calcular el factor de beneficio
export const calculateProfitFactor = (trades) => {
  if (!trades || trades.length === 0) return 0;

  const grossProfit = trades
    .filter((trade) => trade.pnl > 0)
    .reduce((total, trade) => total + trade.pnl, 0);

  const grossLoss = Math.abs(
    trades
      .filter((trade) => trade.pnl < 0)
      .reduce((total, trade) => total + trade.pnl, 0)
  );

  if (grossLoss === 0) return grossProfit > 0 ? 999 : 0;

  return grossProfit / grossLoss;
};

// Generar historial de PNL
export const generatePnLHistory = (trades) => {
  if (!trades || trades.length === 0) return [];

  // Ordenar operaciones por fecha
  const sortedTrades = [...trades].sort(
    (a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime()
  );

  let cumulativePnl = 0;
  return sortedTrades.map((trade) => {
    cumulativePnl += trade.pnl || 0;
    return {
      date: trade.entryDate.split("T")[0], // Formato YYYY-MM-DD
      pnl: trade.pnl || 0,
      cumulativePnl: cumulativePnl,
    };
  });
};

// Generar distribución de operaciones
export const generateTradeDistribution = (trades) => {
  if (!trades || trades.length === 0) return [];

  const longWins = trades.filter(
    (trade) => trade.type === "Long" && trade.pnl > 0
  ).length;
  const longLosses = trades.filter(
    (trade) => trade.type === "Long" && trade.pnl < 0
  ).length;
  const shortWins = trades.filter(
    (trade) => trade.type === "Short" && trade.pnl > 0
  ).length;
  const shortLosses = trades.filter(
    (trade) => trade.type === "Short" && trade.pnl < 0
  ).length;

  return [
    { name: "Long Wins", value: longWins, color: "#4caf50" },
    { name: "Long Losses", value: longLosses, color: "#f44336" },
    { name: "Short Wins", value: shortWins, color: "#2196f3" },
    { name: "Short Losses", value: shortLosses, color: "#ff9800" },
  ];
};
