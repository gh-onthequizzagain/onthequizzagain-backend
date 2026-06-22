import type { Response, Request, NextFunction } from "express";

import { logBasic, logError } from "../helpers/log";

/**
 * Custom error class that includes an HTTP status code.
 */
export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * middleware : Manage error globaly
 */
const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logBasic(`ErrorHandler activated [${error.message}]`);

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  logError(
    `An error was caught (httpStatus ${statusCode}) ("${errorMessage}")`,
  );

  res.status(statusCode).json({
    message: errorMessage,
    code: statusCode,
  });
};

export default errorHandler;
