import { Task } from "../models/tasks.model.js";
import { TaskStatusEnum } from "../models/enums.js";
import { query } from "../utils/db.js";

export async function createTaskService(data: {
  title: string;
  description?: string;
}): Promise<Task> {
  const result = await query<Task>(
    `INSERT INTO tasks (title, description)
         VALUES ($1, $2)
         RETURNING id, title, description, status, created_at, updated_at`,
    [data.title, data.description ?? null]
  );
  return result.rows[0];
}

export async function getTasksService(): Promise<Task[]> {
  const result = await query<Task>(
    `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       WHERE is_deleted = FALSE
       ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getTaskByIdService(id: number): Promise<Task | null> {
  const result = await query<Task>(
    `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function updateTaskStatusService(
  id: number,
  status: TaskStatusEnum
): Promise<Task | null> {
  const result = await query<Task>(
    `UPDATE tasks
       SET status = $1
       WHERE id = $2
       RETURNING id, title, description, status, created_at, updated_at`,
    [status, id]
  );
  return result.rows[0] ?? null;
}

export async function softDeleteTaskService(id: number): Promise<Task | null> {
  const result = await query<Task>(
    `UPDATE tasks
       SET is_deleted = TRUE
       WHERE id = $1
       RETURNING id, title, description, status, created_at, updated_at`,
    [id]
  );
  return result.rows[0] ?? null;
}
