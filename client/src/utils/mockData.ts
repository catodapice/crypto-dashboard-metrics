// Definir la interfaz para los datos de demostración
export interface MockData {
  executions: Array<{
    symbol: string;
    side: string;
    orderQty: number;
    price: number;
    execType: string;
    ordType: string;
    orderID: string;
    execID: string;
    timestamp: string;
  }>;
  walletHistory: Array<{
    transactTime: string;
    amount: number;
    fee: number;
    transactType: string;
    address: string;
  }>;
  trades?: Array<any>;
  pnlTransactions?: Array<any>;
  pnlHistory?: Array<any>;
}

// Crear un nuevo archivo para datos de demostración
export const mockData: MockData = {
  executions: [
    // Añadir algunos datos de ejemplo para ejecuciones
    {
      symbol: "XBTUSD",
      side: "Buy",
      orderQty: 1000,
      price: 45000,
      execType: "Trade",
      ordType: "Limit",
      orderID: "order-1",
      execID: "exec-1",
      timestamp: new Date().toISOString(),
    },
    {
      symbol: "XBTUSD",
      side: "Sell",
      orderQty: 1000,
      price: 46000,
      execType: "Trade",
      ordType: "Limit",
      orderID: "order-1",
      execID: "exec-2",
      timestamp: new Date(Date.now() + 3600000).toISOString(),
    },
    // Añadir más ejemplos según sea necesario
  ],

  walletHistory: [
    {
      transactTime: new Date().toISOString(),
      amount: 1000,
      fee: 10,
      transactType: "RealisedPNL",
      address: "XBTUSD",
    },
    {
      transactTime: new Date(Date.now() - 86400000).toISOString(),
      amount: 500,
      fee: 5,
      transactType: "RealisedPNL",
      address: "ETHUSD",
    },
  ],

  // Añadir estos campos para evitar errores de TypeScript
  trades: [],
  pnlTransactions: [],
  pnlHistory: [],
};
