import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import tasksRouter from "./routes/tasks";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/tasks", tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    const status = err?.statusCode ?? 500;
    res.status(status).json({ error: err?.message ?? "Internal Server Error" });
  }
);

export default app;
