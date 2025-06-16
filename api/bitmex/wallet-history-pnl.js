const axios = require("axios");
const crypto = require("crypto");

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-api-secret"
  );

  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Get credentials from request headers
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-api-secret"];
    const isTestnet = req.headers["x-testnet"] === "true";

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        error: { message: "API key and secret are required" },
      });
    }

    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";

    // Generate signature for authentication
    const path = "/api/v1/wallet/history";
    const expires = Math.round(new Date().getTime() / 1000) + 60;
    const message = "GET" + path + expires;
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const response = await axios.get(`${baseUrl}/wallet/history`, {
      headers: {
        "api-key": apiKey,
        "api-signature": signature,
        "api-expires": expires,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching wallet history:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || { message: error.message },
    });
  }
};
