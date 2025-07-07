const { runConsumer } = require("./kafkaConsumer");

(async () => {
  try {
    await runConsumer();
  } catch (err) {
    console.error("[CONSUMER] Error:", err);
  }
})();
