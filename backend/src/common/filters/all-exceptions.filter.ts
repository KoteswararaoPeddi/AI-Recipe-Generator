import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

/**
 * Shapes every thrown error into `{ success: false, message }` with the right status.
 * Nest HttpExceptions keep their status/message; anything else becomes a 500 with a
 * generic message (the real error is logged, never leaked to the client).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong. Please try again.";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === "string") {
        message = res;
      } else if (res && typeof res === "object" && "message" in res) {
        const m = (res as { message: string | string[] }).message;
        message = Array.isArray(m) ? m[0] : m;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `[${request.method} ${request.url}] ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({ success: false, message });
  }
}
