import { Router } from "express";
import { success, z } from "zod";
import { query } from "../utils/db";
import { Task } from "../models/tasks";
import { TaskStatusEnum, ZodErrorEnum } from "../models/enums";
import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

const router = Router();

const CreateTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

const UpdateStatusSchema = z.object({
  status: z.enum([
    TaskStatusEnum.PENDING,
    TaskStatusEnum.IN_PROGRESS,
    TaskStatusEnum.COMPLETED,
  ]),
});

// POST /api/tasks - Create a new task
router.post("/", async (req, res, next) => {
  try {
    const body = CreateTaskSchema.parse(req.body);

    const result = await query<Task>(
      `INSERT INTO tasks (title, description)
       VALUES ($1, $2)
       RETURNING id, title, description, status, created_at, updated_at`,
      [body.title, body.description ?? null]
    );

    res
      .status(StatusCodes.CREATED)
      .json({ status: true, data: result.rows[0] });
  } catch (err: any) {
    if (err?.name === ZodErrorEnum.ZOD_ERROR) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: ZodErrorEnum.VALIDATION_ERROR, details: err.issues });
    }
    next(err);
  }
});

// GET /api/tasks - Get all tasks
router.get("/", async (_req, res, next) => {
  try {
    // console.log(_req.cookies); // Example of accessing cookies if case to be used for translation
    const result = await query<Task>(
      `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       WHERE is_deleted = FALSE
       ORDER BY created_at DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/:id - Get single task
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const result = await query<Task>(
      `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       WHERE id = $1 AND is_deleted = FALSE`,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: ZodErrorEnum.TASK_NOT_FOUND });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/tasks/:id - Update task status
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const body = UpdateStatusSchema.parse(req.body);

    const result = await query<Task>(
      `UPDATE tasks
       SET status = $1
       WHERE id = $2
       RETURNING id, title, description, status, created_at, updated_at`,
      [body.status, id]
    );

    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: ZodErrorEnum.TASK_NOT_FOUND });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    if (err?.name === ZodErrorEnum.ZOD_ERROR) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: ZodErrorEnum.VALIDATION_ERROR,
        details: err.issues,
      });
    }
    next(err);
  }
});

// DELETE /api/tasks/:id - Soft Delete a task
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const result = await query<Task>(
      `UPDATE tasks
       SET is_deleted = TRUE
       WHERE id = $1
       RETURNING id, title, description, status, created_at, updated_at`,
      [id]
    );

    if (result.rows.length === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: ZodErrorEnum.TASK_NOT_FOUND });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err: any) {
    if (err?.name === ZodErrorEnum.ZOD_ERROR) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        error: ZodErrorEnum.VALIDATION_ERROR,
        details: err.issues,
      });
    }
    next(err);
  }
});

export default router;
