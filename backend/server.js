import "dotenv/config";
import express from "express";
import cors from "cors";
import agricultureNewsRoutes from "./routes/agricultureNewsRoutes.js";
import { logger } from "./utils/logger.js";

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || true }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "farmalert-backend" });
});

app.use("/api/agriculture-news", agricultureNewsRoutes);

app.use((error, _req, res, _next) => {
  logger.error("API error.", { error: error.message });
  res.status(500).json({ error: "Internal server error." });
});

app.listen(port, () => {
  logger.info("FarmAlert backend listening.", { port });
});
