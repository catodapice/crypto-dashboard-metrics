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
 * Formats a PnL value with sign and thousands separator
 * @param amount Amount to format
 * @param decimals Number of decimals (default 2)
 * @returns Formatted string with sign
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
 * Formats an ISO date to readable format
 * @param dateString Date in ISO format
 * @returns Formatted date
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-US", {
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

// Function to format percentages
export const formatPercentage = (value: number): string => {
  if (isNaN(value)) return "0.0%";

  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
};

// Empty export to ensure the file is treated as a module
export {};
