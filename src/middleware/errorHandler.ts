import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // console.error(`[Error] ${statusCode} - ${message}`);
  // console.error(err.stack);

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const err: AppError = new Error("Not Found");
  err.statusCode = 404;
  next(err);
}
