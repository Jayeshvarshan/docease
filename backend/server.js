import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initDB } from "./config/mysql.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(cors());

let dbReady = false;
let dbError = null;

initDB()
  .then(() => { dbReady = true; console.log("DB connected"); })
  .catch((err) => { dbError = err.message; console.error("DB init failed:", err.message); });

app.get("/api/health", (req, res) => {
  const dbUrl = process.env.DATABASE_URL;
  const masked = dbUrl ? dbUrl.substring(0, 30) + "..." : "NOT SET";
  res.json({ success: true, dbReady, dbError, dbUrlPreview: masked });
});

app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

const frontendPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

export default app;
