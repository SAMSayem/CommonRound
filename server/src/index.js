import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import eventsRouter from "./routes/events.js";
import { connectDatabase } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean);

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("This origin is not allowed by the API."));
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false }));

app.get("/health", (_req, res) => res.json({ success: true, service: "CommonGround API", status: "healthy" }));
app.use("/api", eventsRouter);

app.use((req, res) => res.status(404).json({ success: false, message: `No route found for ${req.method} ${req.path}.` }));
app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.message === "This origin is not allowed by the API.") {
    return res.status(403).json({ success: false, message: error.message });
  }
  return res.status(500).json({ success: false, message: "Something went wrong on the server. Please try again." });
});

async function start() {
  await connectDatabase();
  app.listen(port, () => console.log(`CommonGround API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error("API could not start:", error.message);
  process.exit(1);
});
