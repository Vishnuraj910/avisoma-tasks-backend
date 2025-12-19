import z from "zod";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { TaskStatusEnum, ZodErrorEnum } from "../models/enums";
import {
  createTaskService,
  getTasksService,
  getTaskByIdService,
  updateTaskStatusService,
  softDeleteTaskService,
} from "../services/tasks.service";

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

export async function createTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = CreateTaskSchema.parse(req.body);
    const task = await createTaskService(body);
    res.status(StatusCodes.CREATED).json({ status: true, data: task });
  } catch (err: any) {
    if (err?.name === ZodErrorEnum.ZOD_ERROR) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: ZodErrorEnum.VALIDATION_ERROR, details: err.issues });
    }
    next(err);
  }
}

export async function getTasksController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // console.log(req.cookies); // Example of accessing cookies if case to be used for translation
    const tasks = await getTasksService();
    res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function getTaskByIdController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const task = await getTaskByIdService(id);
    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: ZodErrorEnum.TASK_NOT_FOUND });
    }

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatusController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const body = UpdateStatusSchema.parse(req.body);
    const task = await updateTaskStatusService(id, body.status);

    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: ZodErrorEnum.TASK_NOT_FOUND });
    }

    res.json({ success: true, data: task });
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
}

export async function deleteTaskController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Invalid id" });
    }

    const task = await softDeleteTaskService(id);

    if (!task) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, error: ZodErrorEnum.TASK_NOT_FOUND });
    }

    res.json({ success: true, data: task });
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
}
