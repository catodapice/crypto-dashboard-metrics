import axios from "axios";

export default async function handler(req, res) {
  // Set CORS headers for all responses
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,DELETE,OPTIONS,PATCH,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-api-secret, x-testnet"
  );

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: { message: "Method not allowed" } });
  }

  try {
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-api-secret"];
    const isTestnet = req.headers["x-testnet"] === "true";

    console.log("Received request with:", {
      apiKey: apiKey ? `${apiKey.substring(0, 5)}...` : "none",
      isTestnet,
    });

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        error: { message: "API credentials are required" },
      });
    }

    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";

    // Get wallet history
    const response = await axios.get(`${baseUrl}/wallet/history`, {
      headers: {
        "api-key": apiKey,
        "api-secret": apiSecret,
      },
    });

    console.log("BitMEX API response status:", response.status);

    // Ensure we have valid data
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error("Invalid response from BitMEX API");
    }

    // Return the transactions
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Error in wallet-history-pnl:", error);

    if (error.response) {
      console.error("BitMEX API error:", error.response.data);
      return res.status(error.response.status).json({
        error: {
          message:
            error.response.data.error?.message ||
            "Error fetching wallet history",
        },
      });
    }

    return res.status(500).json({
      error: { message: "Internal server error" },
    });
  }
}
