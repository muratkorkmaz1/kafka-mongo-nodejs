const { Kafka } = require("kafkajs");
const { saveToMongo } = require("./mongoClient");
require("dotenv").config();

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: "log-group" });

const runConsumer = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: process.env.TOPIC_NAME, fromBeginning: true });

  console.log("[CONSUMER] Listening for messages...");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const value = message.value.toString();
      console.log(`[CONSUMER] Received: ${value}`);
      await new Promise((res) => setTimeout(res, 10000)); // 10s delay
      await saveToMongo({ value });
    },
  });
};

module.exports = { runConsumer };
