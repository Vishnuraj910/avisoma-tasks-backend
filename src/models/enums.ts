export enum TaskStatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

export enum ZodErrorEnum {
  ZOD_ERROR = "ZodError",
  TASK_NOT_FOUND = "Task not found",
  VALIDATION_ERROR = "Validation error",
  REQUIRED = "required",
  INVALID_ENUM_VALUE = "invalid_enum_value",
  TOO_SMALL = "too_small",
  TOO_BIG = "too_big",
}
