import axios from "axios";
import CryptoJS from "crypto-js";

class BitmexService {
  private apiKey: string = "";
  private apiSecret: string = "";
  private isTestnet: boolean = false;
  private baseUrl: string = "https://www.bitmex.com/api/v1";
  private apiBaseUrl: string =
    "https://crypto-dashboard-metrics-81zv.vercel.app/api";

  // Method to configure credentials
  setCredentials(
    apiKey: string,
    apiSecret: string,
    isTestnet: boolean = false
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.isTestnet = isTestnet;
  }

  // Method to check if credentials are set
  hasCredentials(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  // Method to generate HMAC signature for authentication
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

  // Generic method to make API requests
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
    } catch (error: any) {
      console.error("API request error:", error.response?.data || error);
      throw error;
    }
  }

  // Method to search for a transaction in a CSV
  async searchTransactionInCSV(csvContent: string, txId: string) {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/bitmex/csv-search?txId=${txId}`,
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

  // Method to get executions with pagination
  async getExecutions(count = 100, start = 0) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/bitmex/executions?count=${count}&start=${start}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching executions:", error);
      throw error;
    }
  }

  // Method to get all executions (with pagination)
  async getAllExecutions(maxResults = 10000) {
    try {
      console.log("Fetching all executions...");
      let allExecutions = [];
      let start = 0;
      const count = 500; // Number of executions per request

      while (allExecutions.length < maxResults) {
        console.log(`Fetching executions from ${start}...`);
        try {
          const executions = await this.getExecutions(count, start);

          if (!executions || executions.length === 0) {
            console.log("No more executions found");
            break; // No more executions
          }

          allExecutions = [...allExecutions, ...executions];
          console.log(
            `Fetched ${executions.length} executions, total: ${allExecutions.length}`
          );

          if (executions.length < count) {
            console.log("Last page reached (received less than requested)");
            break; // Last page
          }

          start += count;
        } catch (error) {
          console.error("Error in pagination:", error);
          // Continue with what we already have
          break;
        }
      }

      console.log(`Total executions collected: ${allExecutions.length}`);
      return allExecutions;
    } catch (error) {
      console.error("Error fetching all executions:", error);
      return []; // Return empty array in case of error
    }
  }

  // Method to get wallet history with realized PnL
  async getWalletHistoryWithPnL() {
    try {
      // Validate that credentials are set
      if (!this.apiKey || !this.apiSecret) {
        throw new Error(
          "API credentials not set. Please select an account first."
        );
      }

      const response = await axios.get(
        `${this.apiBaseUrl}/bitmex/wallet-history-pnl`,
        {
          headers: {
            "x-api-key": this.apiKey,
            "x-api-secret": this.apiSecret,
          },
        }
      );

      // Ensure we have valid data
      if (!response.data) {
        throw new Error("No data received from the server");
      }

      // If we received an error object, throw it
      if (response.data.error) {
        throw new Error(
          response.data.error.message || "Error fetching PnL data"
        );
      }

      // Ensure we have an array of transactions
      const transactions = Array.isArray(response.data) ? response.data : [];

      // Calculate total PnL (amount - fee)
      const totalPnL = transactions.reduce(
        (sum: number, tx: any) => sum + (tx.amount || 0) - (tx.fee || 0),
        0
      );

      return {
        transactions,
        totalPnL,
      };
    } catch (error) {
      console.error("Error in getWalletHistoryWithPnL:", error);
      throw error;
    }
  }

  // Method to search for a transaction by ID
  async searchTransaction(txId: string) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/bitmex/transaction/${txId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error searching transaction:", error);
      throw error;
    }
  }

  // Method to get wallet balance
  async getWalletBalance() {
    try {
      // Validate that credentials are set
      if (!this.apiKey || !this.apiSecret) {
        throw new Error(
          "API credentials not set. Please select an account first."
        );
      }

      const response = await axios.get(
        `http://localhost:5000/api/bitmex/wallet-alt`,
        {
          headers: {
            "x-api-key": this.apiKey,
            "x-api-secret": this.apiSecret,
          },
        }
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

  // Fetch open positions
  async getPositions() {
    try {
      // Validate that credentials are set
      if (!this.apiKey || !this.apiSecret) {
        throw new Error(
          "API credentials not set. Please select an account first."
        );
      }

      const response = await axios.get(
        "http://localhost:5000/api/bitmex/positions",
        {
          headers: {
            "x-api-key": this.apiKey,
            "x-api-secret": this.apiSecret,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw error;
    }
  }

  // Fetch recent trades
  async getRecentTrades(count = 100, start = 0) {
    try {
      // Validate that credentials are set
      if (!this.apiKey || !this.apiSecret) {
        throw new Error(
          "API credentials not set. Please select an account first."
        );
      }

      const response = await axios.get(
        `http://localhost:5000/api/bitmex/trades?count=${count}&start=${start}`,
        {
          headers: {
            "x-api-key": this.apiKey,
            "x-api-secret": this.apiSecret,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching trades:", error);
      throw error;
    }
  }

  // Alias for wallet history with PnL
  async getWalletHistory() {
    const data = await this.getWalletHistoryWithPnL();
    return data.transactions;
  }
}

export const bitmexService = new BitmexService();
