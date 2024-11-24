import createError from "http-errors";
import { ErrorRequestHandler, Request, Response, NextFunction } from "express";

type CustomError = Error & {
  code?: number;
};

export const errorHandler: ErrorRequestHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error.code === 11000) {
    return next(createError(400, error.message));
  }
  if (error.name === "ValidationError") {
    return next(createError(400, error.message));
  }
  if (error.name === "CastError") {
    return next(createError(400, error.message));
  }
  if (error.name === "UnauthorizedError") {
    return next(createError(401, error.message));
  } else {
    return next(createError(500, error.message));
  }
};
