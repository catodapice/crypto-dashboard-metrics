export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method not allowed" } });
    return;
  }

  try {
    const csvData = req.body;
    const txId = req.query.txId;

    if (!csvData || !txId) {
      return res.status(400).json({ error: "CSV and transaction ID are required" });
    }

    const lines = csvData.split("\n");
    const headers = lines[0]
      .split(",")
      .map((h) => h.replace(/\"/g, "").trim());

    let transaction = null;

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(",").map((v) => v.replace(/\"/g, "").trim());
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
      res.status(200).json(transaction);
    } else {
      res.status(404).json({ error: "Transaction not found in CSV" });
    }
  } catch (error) {
    console.error("csv-search error", error);
    res.status(500).json({ error: error.message });
  }
}
