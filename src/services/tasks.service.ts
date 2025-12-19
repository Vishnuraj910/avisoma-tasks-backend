import { Task } from "../models/tasks";
import { query } from "../utils/db";

async function createTasksService(data: {
  title: string;
  description?: string;
}): Promise<{ rows: Task[] }> {
  return await query<Task>(
    `INSERT INTO tasks (title, description)
         VALUES ($1, $2)
         RETURNING id, title, description, status, created_at, updated_at`,
    [data.title, data.description ?? null]
  );
}

async function getTasksService(): Promise<{ rows: Task[] }> {
  return await query<Task>(
    `SELECT id, title, description, status, created_at, updated_at
       FROM tasks
       WHERE is_deleted = FALSE
       ORDER BY created_at DESC`
  );
}

export default { createTasksService, getTasksService };
