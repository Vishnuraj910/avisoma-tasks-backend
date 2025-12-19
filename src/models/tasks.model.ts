import { TaskStatusEnum } from "./enums.js";

export type TaskStatus =
  | TaskStatusEnum.PENDING
  | TaskStatusEnum.IN_PROGRESS
  | TaskStatusEnum.COMPLETED;

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface ResponseInterface<T> {
  data: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface ExpressError extends Error {
  status?: number;
  statusCode?: number;
}
