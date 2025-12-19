import z from "zod";
import { TaskStatusEnum, ZodErrorEnum } from "../models/enums";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import getTasksService from "../services/tasks.service";

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

async function createTasksController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const body = CreateTaskSchema.parse(req.body);

    const result = await getTasksService.createTasksService(body);
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
}

async function getTasksController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // console.log(req.cookies); // Example of accessing cookies if case to be used for translation
    const result = await getTasksService.getTasksService();
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
}

export default {
  createTasksController,
  getTasksController,
};
