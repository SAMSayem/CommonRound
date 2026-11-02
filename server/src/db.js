import { MongoClient } from "mongodb";

let client;
let database;

export async function connectDatabase() {
  if (database) return database;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Add it to server/.env before starting the API.");

  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  database = client.db(process.env.DB_NAME || undefined);

  await Promise.all([
    database.collection("events").createIndex({ eventDate: 1 }),
    database.collection("events").createIndex({ creatorId: 1, eventDate: 1 }),
    database.collection("event_participants").createIndex({ eventId: 1, userId: 1 }, { unique: true }),
    database.collection("event_participants").createIndex({ userId: 1, createdAt: -1 }),
  ]);

  console.log(`MongoDB connected${database.databaseName ? ` to ${database.databaseName}` : ""}`);
  return database;
}

export async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}
