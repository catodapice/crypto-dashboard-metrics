// Ruta para obtener el historial de wallet con PnL realizado
app.get("/api/bitmex/wallet-history-pnl", async (req, res) => {
  try {
    const count = req.query.count || 10000;
    const currency = req.query.currency || "USDt";
    const reverse = req.query.reverse !== "false"; // Por defecto true

    // Generar firma para autenticación
    const path = `/api/v1/user/walletHistory`;
    const expires = Math.round(new Date().getTime() / 1000) + 60;

    // Parámetros de consulta
    const params = {
      count,
      currency,
      reverse,
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

    // Filtrar solo las transacciones de PnL realizado
    const pnlTransactions = response.data.filter(
      (tx) => tx.transactType === "RealisedPNL"
    );

    console.log(`Found ${pnlTransactions.length} RealisedPNL transactions`);

    // No convertir los valores, mantenerlos como están
    res.json(pnlTransactions);
  } catch (error) {
    console.error(
      `Error fetching wallet history PnL:`,
      error.response?.data || error.message
    );

    // Devolver el error para que el cliente lo maneje
    res.status(500).json({
      error: error.response?.data?.error?.message || error.message,
    });
  }
});
