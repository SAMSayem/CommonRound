import { MongoClient } from "mongodb";

let client;
let database;

/**
 * Validate the shape of a MongoDB URI without logging or revealing credentials.
 * In MongoDB connection strings, reserved characters in credentials must be
 * percent-encoded. An @ inside a password must be written as %40.
 */
export function validateMongoUri(uri) {
  if (typeof uri !== "string" || !uri.trim()) {
    throw new Error("MONGODB_URI is missing. Add it to the server environment.");
  }

  const value = uri.trim();
  if (/\s/.test(value)) {
    throw new Error("MONGODB_URI contains whitespace. Keep the URI on one line with no spaces.");
  }

  const protocolMatch = value.match(/^mongodb(\+srv)?:\/\/([^/?#]*)/i);
  if (!protocolMatch) {
    throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://.");
  }

  const authority = protocolMatch[2];
  const atCount = (authority.match(/@/g) || []).length;
  if (atCount > 1) {
    throw new Error(
      "MONGODB_URI has more than one unencoded @ in its host section. URL-encode reserved characters in the username/password; for example, @ must become %40."
    );
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname) throw new Error("hostname missing");
  } catch {
    throw new Error("MONGODB_URI is not a valid MongoDB connection URI. Copy the current URI from MongoDB Atlas and replace only its credential placeholders.");
  }

  return value;
}

export async function connectDatabase() {
  if (database) return database;

  const uri = validateMongoUri(process.env.MONGODB_URI);
  const dbName = process.env.DB_NAME?.trim();

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      appName: "CommonGround-API",
    });
    await client.connect();
    database = client.db(dbName || undefined);

    await Promise.all([
      database.collection("events").createIndex({ eventDate: 1 }),
      database.collection("events").createIndex({ creatorId: 1, eventDate: 1 }),
      database.collection("event_participants").createIndex(
        { eventId: 1, userId: 1 },
        { unique: true, name: "unique_event_participant" },
      ),
      database.collection("event_participants").createIndex({ userId: 1, createdAt: -1 }),
    ]);

    console.log(`MongoDB connected${database.databaseName ? ` to ${database.databaseName}` : ""}`);
    return database;
  } catch (error) {
    if (client) {
      try { await client.close(); } catch { /* keep the original connection error */ }
    }
    client = undefined;
    database = undefined;

    if (error?.message === "Invalid connection string") {
      throw new Error("MongoDB rejected MONGODB_URI. Check the Atlas hostname and URL-encode reserved characters in the username/password.");
    }
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

export async function closeDatabase() {
  if (client) await client.close();
  client = undefined;
  database = undefined;
}
