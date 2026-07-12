import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();
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
let dbInitPromise = null;

function ensureDbInit() {
  if (!dbInitPromise) {
    dbInitPromise = initDB()
      .then(() => { dbReady = true; })
      .catch((err) => { console.error("DB init failed:", err.message); });
  }
  return dbInitPromise;
}

ensureDbInit();

app.use(async (req, res, next) => {
  if (!dbReady) {
    await ensureDbInit();
  }
  if (!dbReady) {
    return res.status(503).json({ success: false, message: "Database not ready" });
  }
  next();
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
