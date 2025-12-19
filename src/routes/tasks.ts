import { Router } from "express";
import {
  createTaskController,
  deleteTaskController,
  getTaskByIdController,
  getTasksController,
  updateTaskStatusController,
} from "../controllers/tasks.controller";

const router = Router();

// POST /api/tasks - Create a new task
router.post("/", createTaskController);

// GET /api/tasks - Get all tasks
router.get("/", getTasksController);

// GET /api/tasks/:id - Get single task
router.get("/:id", getTaskByIdController);

// PATCH /api/tasks/:id - Update task status
router.patch("/:id", updateTaskStatusController);

// DELETE /api/tasks/:id - Soft Delete a task
router.delete("/:id", deleteTaskController);

export default router;
