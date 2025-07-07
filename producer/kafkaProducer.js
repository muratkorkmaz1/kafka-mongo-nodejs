const { Kafka } = require("kafkajs");
require("dotenv").config();

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
  console.log("[PRODUCER] Connected to Kafka");
};

const sendMessage = async (message) => {
  await producer.send({
    topic: process.env.TOPIC_NAME,
    messages: [{ value: message }],
  });
  console.log(`[PRODUCER] Sent: ${message}`);
};

module.exports = { connectProducer, sendMessage };
