import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import eventsRouter from "./routes/events.js";
import { connectDatabase, closeDatabase } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_URLS || "https://common-round-q3fp.vercel.app")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    // Requests without an Origin header include health checks and server-to-server calls.
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
    return callback(new Error("This origin is not allowed by the API."));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/", (_req, res) => res.json({
  success: true,
  service: "CommonGround API",
  health: "/health",
  documentation: "See the server README for available endpoints.",
}));

app.get("/health", (_req, res) => res.json({
  success: true,
  service: "CommonGround API",
  status: "healthy",
  timestamp: new Date().toISOString(),
}));

app.use("/api", eventsRouter);

app.use((req, res) => res.status(404).json({
  success: false,
  message: `No route found for ${req.method} ${req.path}.`,
}));

app.use((error, _req, res, _next) => {
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body must contain valid JSON." });
  }
  if (error.message === "This origin is not allowed by the API.") {
    return res.status(403).json({ success: false, message: error.message });
  }
  console.error("API request failed:", error.message);
  return res.status(500).json({
    success: false,
    message: "Something went wrong on the server. Please try again.",
  });
});

let httpServer;

async function start() {
  await connectDatabase();
  httpServer = app.listen(port, "0.0.0.0", () => {
    console.log(`CommonGround API listening on 0.0.0.0:${port}`);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down CommonGround API...`);
  if (httpServer) {
    httpServer.close(async () => {
      await closeDatabase();
      process.exit(0);
    });
  } else {
    await closeDatabase();
    process.exit(0);
  }
}

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

start().catch((error) => {
  console.error("API could not start:", error.message);
  process.exit(1);
});
