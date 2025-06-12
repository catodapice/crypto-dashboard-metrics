// Load environment variables from .env
require("dotenv").config();

// Process command line arguments
const argv = require("yargs")
  .option("env", {
    alias: "e",
    description: "Specify environment (prod or test)",
    type: "string",
    default: process.env.BITMEX_TEST_NET === "true" ? "test" : "prod",
  })
  .help()
  .alias("help", "h").argv;

// Determine environment based on argument
const isTestnet = argv.env === "test";
const apiKey = isTestnet
  ? process.env.BITMEX_TEST_API_KEY
  : process.env.BITMEX_PROD_API_KEY;
const apiSecret = isTestnet
  ? process.env.BITMEX_TEST_API_SECRET
  : process.env.BITMEX_PROD_API_SECRET;

function resolveCredentials(req) {
  return {
    key:
      req.headers["x-api-key"] ||
      req.headers["api-key"] ||
      apiKey,
    secret:
      req.headers["x-api-secret"] ||
      req.headers["api-secret"] ||
      apiSecret,
  };
}

// Add this information to the initial log
console.log("Environment variables loaded:");
console.log("- BITMEX_TEST_NET:", isTestnet);
console.log("- Using API keys for:", isTestnet ? "TESTNET" : "PRODUCTION");
console.log("- API Key exists:", !!apiKey);
console.log("- API Secret exists:", !!apiSecret);
console.log(`Running in ${isTestnet ? "TESTNET" : "PRODUCTION"} mode`);

const express = require("express");
const axios = require("axios");
const cors = require("cors");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const CryptoJS = require("crypto-js");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ruta proxy para BitMEX
app.post("/api/bitmex/proxy", async (req, res) => {
  try {
    const { method, endpoint, data } = req.body;
    // Usar las variables globales en lugar de las del cliente
    // const { apiKey, apiSecret } = req.body;

    // Usar la variable global isTestnet
    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";

    // Generar firma
    const path = "/api/v1" + endpoint;
    const expires = Math.round(new Date().getTime() / 1000) + 60;
    const message =
      method + path + expires + (data ? JSON.stringify(data) : "");
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    // Hacer la solicitud a BitMEX
    const response = await axios({
      method,
      url: `${baseUrl}${endpoint}`,
      data,
      headers: {
        "api-expires": expires,
        "api-key": apiKey,
        "api-signature": signature,
        "Content-Type": "application/json",
      },
    });

    // Devolver los datos al cliente
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error proxying request to BitMEX:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Ruta para verificar que el servidor está funcionando
app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });
});

// Ruta para obtener datos públicos de BitMEX
app.get("/api/bitmex/public/instruments", async (req, res) => {
  try {
    // Usar la variable global isTestnet
    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";

    const response = await axios.get(`${baseUrl}/instrument/active`);
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching public BitMEX data:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Ruta para probar la conexión a BitMEX
app.get("/api/bitmex/test", async (req, res) => {
  try {
    const isTestnet = process.env.BITMEX_TEST_NET === "true";
    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";

    const response = await axios.get(`${baseUrl}/instrument/active`);
    res.json({
      status: "success",
      message: "Connected to BitMEX successfully",
      count: response.data.length,
      sample: response.data.slice(0, 3),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to connect to BitMEX",
      error: error.message,
      details: error.response?.data,
    });
  }
});

// Ruta para obtener operaciones del usuario
app.get("/api/bitmex/trades", async (req, res) => {
  try {
    const { key: apiKey, secret: apiSecret } = resolveCredentials(req);
    if (!apiKey || !apiSecret) {
      return res.status(401).json({ error: "API credentials missing" });
    }
    const count = parseInt(req.query.count) || 100;
    const start = parseInt(req.query.start) || 0;

    // Generar firma para autenticación
    const path = "/api/v1/execution";
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Función para generar la firma
    const generateSignature = (method, path, data, secret) => {
      const queryString = Object.entries(data)
        .map(([key, value]) => `${key}=${value}`)
        .join("&");
      const message =
        method + path + (queryString ? "?" + queryString : "") + expires;
      return crypto.createHmac("sha256", secret).update(message).digest("hex");
    };

    const response = await axios.get(
      `${
        isTestnet
          ? "https://testnet.bitmex.com/api/v1"
          : "https://www.bitmex.com/api/v1"
      }/execution`,
      {
        params: {
          count,
          start,
          reverse: true, // Más recientes primero
        },
        headers: {
          "api-key": apiKey,
          "api-signature": generateSignature(
            "GET",
            path,
            {
              count,
              start,
              reverse: true,
            },
            apiSecret
          ),
          "api-expires": expires,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching trades:", error);
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener posiciones actuales
app.get("/api/bitmex/positions", async (req, res) => {
  try {
    const { key: apiKey, secret: apiSecret } = resolveCredentials(req);
    if (!apiKey || !apiSecret) {
      return res.status(401).json({ error: "API credentials not provided" });
    }
    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";

    const path = "/api/v1/position";
    const expires = Math.round(new Date().getTime() / 1000) + 60;
    const message = "GET" + path + expires;
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const response = await axios.get(`${baseUrl}/position`, {
      headers: {
        "api-expires": expires,
        "api-key": apiKey,
        "api-signature": signature,
        "Content-Type": "application/json",
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching positions:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
});

// Ruta para verificar las variables de entorno (solo para desarrollo)
app.get("/api/env-check", (req, res) => {
  res.json({
    environment: isTestnet ? "TESTNET" : "PRODUCTION",
    hasApiKey: !!apiKey,
    hasApiSecret: !!apiSecret,
    // No mostrar las claves reales por seguridad
    apiKeyLength: apiKey ? apiKey.length : 0,
    apiSecretLength: apiSecret ? apiSecret.length : 0,
  });
});

// Ruta para obtener una transacción específica por ID
app.get("/api/bitmex/transaction/:txId", async (req, res) => {
  try {
    const { txId } = req.params;

    if (!txId) {
      return res.status(400).json({
        error: "ID de transacción requerido",
        message: "Debe proporcionar un ID de transacción válido",
      });
    }

    // Generar firma para autenticación
    const path = `/api/v1/execution?filter={"execID":"${txId}"}`;
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Mensaje para firmar
    const message = `GET${path}${expires}`;

    // Generar firma
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const url = `${
      isTestnet ? "https://testnet.bitmex.com" : "https://www.bitmex.com"
    }${path}`;

    console.log("Requesting transaction with URL:", url);

    const response = await axios.get(url, {
      headers: {
        "api-key": apiKey,
        "api-expires": expires,
        "api-signature": signature,
      },
    });

    // Si no se encuentra la transacción, devolver un mensaje amigable
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({
        error: "Transacción no encontrada",
        message: "No se encontró ninguna transacción con ese ID",
      });
    }

    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching transaction:`,
      error.response?.data || error.message
    );

    // Devolver un mensaje de error más descriptivo
    res.status(error.response?.status || 500).json({
      error: "Error al buscar la transacción",
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data,
    });
  }
});

// Ruta alternativa para buscar transacciones
app.get("/api/bitmex/transaction-alt/:txId", async (req, res) => {
  try {
    const txId = req.params.txId;

    // Generar firma para autenticación
    const path = "/api/v1/user/wallet";
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Mensaje para firmar
    const message = `GET${path}${expires}`;

    // Generar firma
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    console.log("Requesting wallet info");

    const url = `${
      isTestnet
        ? "https://testnet.bitmex.com/api/v1"
        : "https://www.bitmex.com/api/v1"
    }/user/wallet`;

    console.log("Request URL:", url);

    const response = await axios.get(url, {
      headers: {
        "api-key": apiKey,
        "api-signature": signature,
        "api-expires": expires,
      },
    });

    // Obtener el historial de transacciones
    const historyPath = "/api/v1/user/walletHistory";
    const historyExpires = Math.round(new Date().getTime() / 1000) + 60;

    // Parámetros de consulta para obtener más transacciones
    const params = {
      count: 100,
      reverse: true,
    };

    // Construir la cadena de consulta
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    // Mensaje para firmar
    const historyMessage = `GET${historyPath}?${queryString}${historyExpires}`;

    // Generar firma
    const historySignature = crypto
      .createHmac("sha256", apiSecret)
      .update(historyMessage)
      .digest("hex");

    const historyUrl = `${
      isTestnet
        ? "https://testnet.bitmex.com/api/v1"
        : "https://www.bitmex.com/api/v1"
    }/user/walletHistory?${queryString}`;

    const historyResponse = await axios.get(historyUrl, {
      headers: {
        "api-key": apiKey,
        "api-signature": historySignature,
        "api-expires": historyExpires,
      },
    });

    // Buscar la transacción por ID
    const transaction = historyResponse.data.find(
      (tx) => tx.transactID === txId
    );

    if (transaction) {
      res.json(transaction);
    } else {
      res.json({
        wallet: response.data,
        recentTransactions: historyResponse.data,
        message:
          "Transacción no encontrada, pero se muestran las transacciones recientes para verificar.",
      });
    }
  } catch (error) {
    console.error(
      `Error fetching wallet info:`,
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Agregar un endpoint para verificar el entorno actual y los permisos
app.get("/api/bitmex/check-environment", async (req, res) => {
  try {
    // Verificar el entorno
    const environment = isTestnet ? "TESTNET" : "PRODUCTION";

    // Verificar permisos de la API
    const path = "/api/v1/apiKey";
    const expires = Math.round(new Date().getTime() / 1000) + 60;
    const message = `GET${path}${expires}`;

    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const url = `${
      isTestnet
        ? "https://testnet.bitmex.com/api/v1"
        : "https://www.bitmex.com/api/v1"
    }/apiKey`;

    const response = await axios.get(url, {
      headers: {
        "api-key": apiKey,
        "api-signature": signature,
        "api-expires": expires,
      },
    });

    res.json({
      environment,
      apiKeyInfo: response.data,
      message: "Verificación completa. Revisa los permisos de la API.",
    });
  } catch (error) {
    console.error(
      "Error checking environment:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Ruta para buscar transacciones en un CSV local
app.post(
  "/api/bitmex/csv-search",
  express.text({ type: "*/*" }),
  (req, res) => {
    try {
      const csvData = req.body;
      const txId = req.query.txId;

      if (!csvData || !txId) {
        return res
          .status(400)
          .json({ error: "CSV and transaction ID are required" });
      }

      // Parse the CSV
      const lines = csvData.split("\n");
      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());

      // Search for the transaction
      let transaction = null;

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        const values = lines[i]
          .split(",")
          .map((v) => v.replace(/"/g, "").trim());
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index];
        });

        if (row.transactID === txId) {
          transaction = row;
          break;
        }
      }

      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ error: "Transaction not found in CSV" });
      }
    } catch (error) {
      console.error("Error searching CSV:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Ruta para obtener el historial de wallet con PnL realizado
app.get("/api/bitmex/wallet-history-pnl", async (req, res) => {
  try {
    const count = req.query.count || 10000;
    const currency = req.query.currency || "USDt";
    const reverse = req.query.reverse !== "false"; // Default true

    // Generate signature for authentication
    const path = `/api/v1/user/walletHistory`;
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Query parameters
    const params = {
      count,
      currency,
      reverse,
    };

    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    // Message to sign
    const message = `GET${path}?${queryString}${expires}`;

    // Generate signature
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const url = `${
      isTestnet ? "https://testnet.bitmex.com" : "https://www.bitmex.com"
    }${path}?${queryString}`;

    console.log("Requesting wallet history with URL:", url);

    const response = await axios.get(url, {
      headers: {
        "api-key": apiKey,
        "api-signature": signature,
        "api-expires": expires,
      },
    });

    // Filter only RealisedPNL transactions
    const pnlTransactions = response.data.filter(
      (tx) => tx.transactType === "RealisedPNL"
    );

    console.log(`Found ${pnlTransactions.length} RealisedPNL transactions`);

    // Don't convert the values, keep them as they are
    res.json(pnlTransactions);
  } catch (error) {
    console.error(
      `Error fetching wallet history PnL:`,
      error.response?.data || error.message
    );

    // Return the error for the client to handle
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

// Ruta para obtener ejecuciones
app.get("/api/bitmex/executions", async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 100;
    const start = parseInt(req.query.start) || 0;
    const filter = req.query.filter || "{}";

    // Generar firma para autenticación
    const path = "/api/v1/execution";
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Parámetros de consulta
    const params = {
      count,
      start,
      reverse: true,
      filter,
    };

    // Construir la cadena de consulta
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&");

    // Mensaje para firmar
    const message = `GET${path}?${queryString}${expires}`;

    // Generar firma
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const url = `${
      isTestnet
        ? "https://testnet.bitmex.com/api/v1"
        : "https://www.bitmex.com/api/v1"
    }/execution?${queryString}`;

    console.log("Requesting executions with URL:", url);

    const response = await axios.get(url, {
      headers: {
        "api-key": apiKey,
        "api-signature": signature,
        "api-expires": expires,
      },
    });

    // Mejorar el logging para ver la estructura completa de los datos
    console.log("=== BITMEX EXECUTIONS RESPONSE ===");
    console.log("Total executions received:", response.data.length);

    if (response.data.length > 0) {
      console.log(
        "First execution sample:",
        JSON.stringify(response.data[0], null, 2)
      );
      console.log(
        "Last execution sample:",
        JSON.stringify(response.data[response.data.length - 1], null, 2)
      );

      // Analizar los tipos de datos
      const firstExec = response.data[0];
      console.log("Data types analysis:");
      Object.keys(firstExec).forEach((key) => {
        console.log(`${key}: ${typeof firstExec[key]} = ${firstExec[key]}`);
      });

      // Verificar fechas
      if (firstExec.timestamp) {
        const date = new Date(firstExec.timestamp);
        console.log(
          `Timestamp parsed: ${date.toISOString()} (valid: ${!isNaN(
            date.getTime()
          )})`
        );
      }
    }

    res.json(response.data);
  } catch (error) {
    console.error(
      `Error fetching executions:`,
      error.response?.data || error.message
    );
    res.status(500).json({ error: error.message });
  }
});

// Ruta para obtener el saldo de la billetera (versión de demostración)
app.get("/api/bitmex/wallet-demo", (req, res) => {
  // Devolver datos de demostración
  res.json({
    amount: 42382,
    currency: "USDt",
    timestamp: new Date().toISOString(),
  });
});

// Implementar una ruta alternativa que use un endpoint diferente
app.get("/api/bitmex/wallet-alt", async (req, res) => {
  try {
    // Intentar con un endpoint diferente que pueda funcionar con subcuentas
    const path = "/api/v1/user/margin";
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Mensaje para firmar
    const message = `GET${path}${expires}`;

    // Generar firma
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const url = `${
      isTestnet ? "https://testnet.bitmex.com" : "https://www.bitmex.com"
    }${path}`;

    console.log("Requesting margin info with URL:", url);

    const response = await axios.get(url, {
      headers: {
        "api-expires": expires,
        "api-key": apiKey,
        "api-signature": signature,
      },
    });

    console.log("Margin response:", response.data);

    // Procesar la respuesta de manera diferente
    res.json({
      amount: response.data.walletBalance,
      currency: response.data.currency,
    });
  } catch (error) {
    console.error(
      `Error fetching margin info:`,
      error.response?.data || error.message
    );

    // Devolver un error en lugar de un valor predeterminado
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

// Add a health-check endpoint
app.get("/api/health-check", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
