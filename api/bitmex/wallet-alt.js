import axios from "axios";
import crypto from "crypto";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key, x-api-secret, x-testnet"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  try {
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-api-secret"];
    const isTestnet = req.headers["x-testnet"] === "true";

    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        error: { message: "API credentials are required" },
      });
    }

    const baseUrl = isTestnet
      ? "https://testnet.bitmex.com/api/v1"
      : "https://www.bitmex.com/api/v1";
    const path = "/api/v1/user/margin";
    const expires = Math.round(Date.now() / 1000) + 60;
    const message = `GET${path}${expires}`;
    const signature = crypto
      .createHmac("sha256", apiSecret)
      .update(message)
      .digest("hex");

    const response = await axios.get(`${baseUrl}/user/margin`, {
      headers: {
        "api-expires": expires,
        "api-key": apiKey,
        "api-signature": signature,
      },
    });

    return res.status(200).json({
      amount: response.data.walletBalance,
      currency: response.data.currency,
    });
  } catch (error) {
    console.error("wallet-alt error", error.response?.data || error.message);
    return res.status(500).json({
      error: { message: error.response?.data?.error?.message || error.message },
    });
  }
}
