// Función para procesar ejecuciones en operaciones
export const processExecutionsIntoTrades = (executions: any[]) => {
  if (!executions || executions.length === 0) {
    return [];
  }

  // Agrupar ejecuciones por orderID
  const executionsByOrder = executions.reduce<Record<string, any[]>>(
    (acc, exec) => {
      if (!acc[exec.orderID]) {
        acc[exec.orderID] = [];
      }
      acc[exec.orderID].push(exec);
      return acc;
    },
    {}
  );

  // Convertir grupos de ejecuciones en operaciones
  const trades = Object.values(executionsByOrder).map((orderExecs: any[]) => {
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
