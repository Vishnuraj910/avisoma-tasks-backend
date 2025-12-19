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
