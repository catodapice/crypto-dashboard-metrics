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
    const { txId } = req.query;
    const apiKey = req.headers["x-api-key"];
    const apiSecret = req.headers["x-api-secret"];
    const isTestnet = req.headers["x-testnet"] === "true";

    if (!apiKey || !apiSecret || !txId) {
      return res.status(400).json({ error: { message: "txId and API credentials are required" } });
    }

    const baseUrl = isTestnet ? "https://testnet.bitmex.com" : "https://www.bitmex.com";
    const path = `/api/v1/execution?filter={\"execID\":\"${txId}\"}`;
    const expires = Math.round(Date.now() / 1000) + 60;
    const message = `GET${path}${expires}`;
    const signature = crypto.createHmac("sha256", apiSecret).update(message).digest("hex");

    const url = `${baseUrl}${path}`;
    const response = await axios.get(url, {
      headers: {
        "api-key": apiKey,
        "api-expires": expires,
        "api-signature": signature,
      },
    });

    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("transaction error", error.response?.data || error.message);
    return res.status(500).json({ error: { message: error.response?.data?.error?.message || error.message } });
  }
}
