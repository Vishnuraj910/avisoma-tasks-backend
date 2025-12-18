import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import tasksRouter from "./routes/tasks";
import { pool } from "./utils/db";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1"); // Check DB Connection

    // More API integrations should be checked here in a real app

    res.status(StatusCodes.OK).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(StatusCodes.SERVICE_UNAVAILABLE).json({
      status: "unhealthy",
      error: "Database connection failed",
      timestamp: new Date().toISOString(),
    });
  }
});

app.use("/api/tasks", tasksRouter);

app.use((_req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ error: "Not found" });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    const status = err?.statusCode ?? StatusCodes.INTERNAL_SERVER_ERROR;
    res.status(status).json({ error: err?.message ?? "Internal Server Error" });
  }
);

export default app;
