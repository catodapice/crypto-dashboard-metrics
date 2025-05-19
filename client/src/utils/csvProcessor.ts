import { format } from "date-fns";

interface CSVTrade {
  transactTime?: string;
  transactType?: string;
  amount?: string | number;
  fee?: string | number;
  address?: string; // Símbolo del instrumento
  currency?: string;
  transactID?: string;
  transactStatus?: string;
  walletBalance?: string | number;
  price?: string | number;
  quantity?: string | number;
}

export const processCSVData = (csvContent: string): any[] => {
  if (!csvContent) return [];

  // Dividir el contenido por líneas
  const lines = csvContent.split("\n").filter((line) => line.trim());

  // Si no hay líneas, devolver array vacío
  if (lines.length === 0) return [];

  // Procesar cada línea
  const trades: CSVTrade[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Ignorar líneas vacías o de encabezado
    if (!line || line.startsWith("Date") || line.startsWith("Fecha")) continue;

    try {
      // Extraer fecha y hora (primeras dos líneas)
      const dateStr = line.split("\n")[0];
      const timeStr = lines[i + 1]?.trim();
      i++; // Avanzar para procesar la siguiente línea

      // Extraer los valores (tercera línea)
      const valuesLine = lines[i + 1]?.trim();
      i++; // Avanzar para procesar la siguiente línea

      if (!valuesLine) continue;

      // Dividir por tabulaciones o espacios múltiples
      const values = valuesLine.split(/\t|\s{2,}/).filter((v) => v.trim());

      // Extraer el ID de transacción (última línea del grupo)
      const idLine = lines[i + 1]?.trim();
      i++; // Avanzar para procesar la siguiente línea

      if (!idLine) continue;

      // Crear objeto de transacción
      const trade: CSVTrade = {
        transactTime: `${dateStr} ${timeStr}`,
        amount: parseFloat(values[0].replace(/,/g, "")),
        fee: parseFloat(values[1].replace(/,/g, "")),
        address: values[2], // Símbolo
        currency: "USDT",
        walletBalance: parseFloat(values[3].replace(/,/g, "")),
        transactID: idLine,
        transactStatus: "Completed",
        transactType: parseFloat(values[0]) > 0 ? "Buy" : "Sell",
      };

      // Calcular precio y cantidad aproximados basados en los datos disponibles
      // Estos son cálculos aproximados ya que el CSV no contiene estos datos directamente
      trade.price = Math.abs(parseFloat(values[3]) / parseFloat(values[0]));
      trade.quantity = Math.abs(parseFloat(values[0]));

      trades.push(trade);
    } catch (error) {
      console.error("Error processing CSV line:", line, error);
      // Continuar con la siguiente línea
    }
  }

  return trades;
};

// Función para formatear los datos CSV para el dashboard
export const formatCSVTradesForDashboard = (csvTrades: CSVTrade[]) => {
  return csvTrades.map((trade) => {
    // Convertir valores a números si son strings
    const amount =
      typeof trade.amount === "string"
        ? parseFloat(trade.amount)
        : trade.amount;
    const fee =
      typeof trade.fee === "string" ? parseFloat(trade.fee) : trade.fee;
    const price =
      typeof trade.price === "string" ? parseFloat(trade.price) : trade.price;
    const quantity =
      typeof trade.quantity === "string"
        ? parseFloat(trade.quantity)
        : trade.quantity;

    // Formatear fecha
    let formattedDate = trade.transactTime;
    try {
      const date = new Date(trade.transactTime);
      formattedDate = format(date, "dd/MM/yyyy HH:mm:ss");
    } catch (e) {
      console.error("Error formatting date:", trade.transactTime);
    }

    return {
      symbol: trade.address,
      type: amount > 0 ? "Long" : "Short",
      entryPrice: price,
      exitPrice: null,
      quantity: quantity,
      entryDate: formattedDate,
      exitDate: null,
      pnl: amount,
      fees: fee,
      status: "Completed",
      // Mantener los campos originales
      ...trade,
    };
  });
};
