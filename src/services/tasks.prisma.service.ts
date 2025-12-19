import { Task } from "../generated/prisma/client.js";
import { TaskStatusEnum } from "../models/enums.js";
import { prisma } from "../utils/prisma.js";
type TaskResponse = Omit<Task, "isDeleted">;

export async function createTaskService(data: {
  title: string;
  description?: string;
}): Promise<Task> {
  const result = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
    },
  });
  return result;
}

export async function getTasksService(): Promise<TaskResponse[]> {
  const result = await prisma.task.findMany({
    where: { isDeleted: false },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return result;
}

export async function getTaskByIdService(id: number): Promise<Task | null> {
  const result = await prisma.task.findFirst({
    where: { id, isDeleted: false },
  });
  return result;
}

export async function updateTaskStatusService(
  id: number,
  status: TaskStatusEnum
): Promise<Task | null> {
  const result = await prisma.task.update({
    where: { id, isDeleted: false },
    data: { status },
  });
  return result;
}

export async function softDeleteTaskService(id: number): Promise<Task | null> {
  const result = await prisma.task.update({
    where: { id, isDeleted: false },
    data: { isDeleted: true },
  });
  return result;
}
