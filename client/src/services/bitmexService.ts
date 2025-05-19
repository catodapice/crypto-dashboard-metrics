import axios from "axios";
import CryptoJS from "crypto-js";

class BitmexService {
  private apiKey: string = "";
  private apiSecret: string = "";
  private baseUrl: string = "https://www.bitmex.com/api/v1";

  // Método para configurar las credenciales
  setCredentials(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  // Método para generar la firma HMAC para autenticación
  private generateSignature(
    verb: string,
    path: string,
    expires: number,
    data: string = ""
  ): string {
    const message = verb + path + expires + data;
    return CryptoJS.HmacSHA256(message, this.apiSecret).toString(
      CryptoJS.enc.Hex
    );
  }

  // Método genérico para hacer solicitudes a la API
  async makeRequest(
    verb: string,
    path: string,
    data: any = {},
    isPublic: boolean = false
  ) {
    try {
      const expires = Math.round(new Date().getTime() / 1000) + 60;
      const url = this.baseUrl + path;

      const config: any = {
        url,
        method: verb,
        headers: {},
      };

      if (verb === "GET") {
        config.params = data;
      } else {
        config.data = data;
      }

      if (!isPublic && this.apiKey && this.apiSecret) {
        const signature = this.generateSignature(
          verb,
          path,
          expires,
          verb === "GET" ? "" : JSON.stringify(data)
        );

        config.headers = {
          "api-expires": expires,
          "api-key": this.apiKey,
          "api-signature": signature,
        };
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error("Error making request to BitMEX API:", error);
      throw error;
    }
  }

  // Métodos para obtener datos específicos
  async getWalletHistory(count = 100) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bitmex/wallet-history?count=${count}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet history:", error);
      throw error;
    }
  }

  async getRecentTrades(symbol: string = "XBTUSD", count: number = 100) {
    return this.makeRequest(
      "GET",
      `/trade?symbol=${symbol}&count=${count}&reverse=true`
    );
  }

  async getPositions() {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/bitmex/positions"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  }

  async getInstruments() {
    return this.makeRequest("GET", "/instrument/active");
  }

  // Método para obtener datos públicos (no requiere autenticación)
  async getPublicData() {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/bitmex/public/instruments"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching public BitMEX data:", error);
      throw error;
    }
  }

  // Obtener operaciones del usuario con paginación
  async getUserTrades(count = 500, start = 0) {
    try {
      const response = await axios.get(
        `/api/bitmex/trades?count=${count}&start=${start}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user trades:", error);
      throw error;
    }
  }

  // Método para obtener todas las operaciones (con múltiples solicitudes si es necesario)
  async getAllUserTrades(maxResults = 1000) {
    try {
      let allTrades = [];
      let start = 0;
      const count = 100; // BitMEX permite máximo 100 por solicitud

      while (allTrades.length < maxResults) {
        const trades = await this.getUserTrades(count, start);

        if (trades.length === 0) {
          break; // No hay más operaciones
        }

        allTrades = [...allTrades, ...trades];
        start += count;

        if (trades.length < count) {
          break; // Última página
        }
      }

      return allTrades;
    } catch (error) {
      console.error("Error fetching all user trades:", error);
      throw error;
    }
  }

  // Buscar una transacción específica por ID
  async getTransactionById(txId: string): Promise<any> {
    if (!txId) {
      throw new Error("Transaction ID is required");
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/bitmex/transaction/${txId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${txId}:`, error);
      throw error;
    }
  }

  // Método para buscar una transacción en un CSV
  async searchTransactionInCSV(csvContent: string, txId: string) {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/bitmex/csv-search?txId=${txId}`,
        csvContent,
        {
          headers: {
            "Content-Type": "text/plain",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error searching transaction in CSV:", error);
      throw error;
    }
  }

  // Método para obtener ejecuciones con paginación
  async getExecutions(count = 100, start = 0) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bitmex/executions?count=${count}&start=${start}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching executions:", error);
      throw error;
    }
  }

  // Método para obtener todas las ejecuciones (con paginación)
  async getAllExecutions(maxResults = 10000) {
    try {
      console.log("Fetching all executions...");
      let allExecutions = [];
      let start = 0;
      const count = 500; // Número de ejecuciones por solicitud

      while (allExecutions.length < maxResults) {
        console.log(`Fetching executions from ${start}...`);
        try {
          const executions = await this.getExecutions(count, start);

          if (!executions || executions.length === 0) {
            console.log("No more executions found");
            break; // No hay más ejecuciones
          }

          allExecutions = [...allExecutions, ...executions];
          console.log(
            `Fetched ${executions.length} executions, total: ${allExecutions.length}`
          );

          if (executions.length < count) {
            console.log("Last page reached (received less than requested)");
            break; // Última página
          }

          start += count;
        } catch (error) {
          console.error("Error in pagination:", error);
          // Continuar con lo que ya tenemos
          break;
        }
      }

      console.log(`Total executions collected: ${allExecutions.length}`);
      return allExecutions;
    } catch (error) {
      console.error("Error fetching all executions:", error);
      return []; // Devolver array vacío en caso de error
    }
  }

  // Method to get wallet history with realized PnL
  async getWalletHistoryWithPnL() {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/bitmex/wallet-history-pnl"
      );

      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || "Error fetching PnL data");
      }

      // Calculate total PnL (amount - fee)
      const totalPnL = response.data.reduce(
        (sum: number, tx: any) => sum + (tx.amount || 0) - (tx.fee || 0),
        0
      );

      return {
        transactions: response.data,
        totalPnL,
      };
    } catch (error) {
      console.error("Error in getWalletHistoryWithPnL:", error);
      throw error;
    }
  }

  // Método para buscar una transacción por ID
  async searchTransaction(txId: string) {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bitmex/transaction/${txId}`
      );

      if (response.data.error) {
        return { error: response.data.error };
      }

      return response.data;
    } catch (error: any) {
      console.error("Error searching transaction:", error);
      return {
        error:
          error.response?.data?.error || error.message || "Error desconocido",
      };
    }
  }

  // Método para obtener el saldo de la wallet
  async getWalletBalance() {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/bitmex/wallet-alt`
      );

      if (!response.data || response.data.error) {
        throw new Error(
          response.data?.error || "Error fetching wallet balance"
        );
      }

      return {
        availableMargin: response.data.amount || 0,
        walletBalance: response.data.walletBalance || 0,
        marginBalance: response.data.marginBalance || 0,
      };
    } catch (error) {
      console.error("Error in getWalletBalance:", error);
      throw error;
    }
  }
}

export const bitmexService = new BitmexService();
