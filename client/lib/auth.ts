import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";
import { MongoClient } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI is missing. Add it to client/.env.local before starting the app.");
}

const globalForMongo = globalThis as typeof globalThis & { mongoClient?: MongoClient };
const mongoClient = globalForMongo.mongoClient ?? new MongoClient(mongoUri);
if (process.env.NODE_ENV !== "production") globalForMongo.mongoClient = mongoClient;

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";
const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const auth = betterAuth({
  appName: "CommonGround",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(mongoClient.db()),
  trustedOrigins: [baseURL, process.env.NEXT_PUBLIC_APP_URL].filter(Boolean) as string[],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },
  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          },
        },
      }
    : {}),
  plugins: [
    jwt({
      jwt: {
        issuer: baseURL,
        audience: baseURL,
        expirationTime: "15m",
        definePayload: ({ user }) => ({
          id: user.id,
          email: user.email,
          name: user.name,
        }),
      },
    }),
  ],
});
