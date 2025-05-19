/**
 * Formats a monetary value with thousands separator and two decimals
 * @param value Amount to format
 * @returns Formatted string
 */
export const formatCurrency = (value: number): string => {
  if (isNaN(value)) return "0.00";

  // Format with 2 decimals and thousands separators
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formatea un valor de PnL con signo y separador de miles
 * @param amount Cantidad a formatear
 * @param decimals Número de decimales (por defecto 2)
 * @returns Cadena formateada con signo
 */
export const formatPnL = (amount: number, decimals: number = 2): string => {
  const isPositive = amount >= 0;
  const formattedAmount = formatCurrency(Math.abs(amount));
  return `${isPositive ? "+" : "-"}${formattedAmount}`;
};

/**
 * Converts a value from satoshis to USDT
 * @param satoshis Value in satoshis
 * @returns Value in USDT
 */
export const satoshisToUSDT = (satoshis: number): number => {
  // Divide by 1000000 to get the correct value
  // Example: 1682039462 / 1000000 = 1682.039462
  return satoshis / 1000000;
};

/**
 * Formatea una fecha ISO a formato legible
 * @param dateString Fecha en formato ISO
 * @returns Fecha formateada
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date);
    }
    return dateString;
  } catch (error) {
    console.error("Error formatting date:", dateString);
    return "N/A";
  }
};

// Función para formatear porcentajes
export const formatPercentage = (value: number): string => {
  if (isNaN(value)) return "0.0%";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

// Exportación vacía para asegurar que el archivo sea tratado como un módulo
export {};
