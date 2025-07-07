const express = require("express");
const { connectProducer, sendMessage } = require("./kafkaProducer");
require("dotenv").config();

const app = express();
app.use(express.json());

app.post("/submit", async (req, res) => {
  const { value } = req.body;
  if (!value) {
    return res.status(400).json({ error: "value is required" });
  }

  try {
    await sendMessage(value);
    res.status(200).json({ status: "Message sent to Kafka" });
  } catch (err) {
    console.error("[PRODUCER] Error sending message", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", async () => {
    await connectProducer();
    console.log(`[PRODUCER] Server running on port ${PORT}`);
  });
  
