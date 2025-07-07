const { MongoClient } = require("mongodb");
require("dotenv").config();

let client;

const connectToMongo = async () => {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    console.log("[MONGO] Connected to MongoDB");
  }
  return client.db(process.env.MONGODB_DB).collection(process.env.MONGODB_COLLECTION);
};

const saveToMongo = async (doc) => {
  const collection = await connectToMongo();
  await collection.insertOne(doc);
  console.log("[MONGO] Document saved:", doc);
};

module.exports = { saveToMongo };
