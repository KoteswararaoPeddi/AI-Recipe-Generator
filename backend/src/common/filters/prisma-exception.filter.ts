import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

/**
 * Maps known Prisma errors to clean HTTP responses, keeping the `{ success: false, message }`
 * envelope. Registered before AllExceptionsFilter so Prisma errors don't fall through to 500.
 */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const response = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Database error.";

    switch (exception.code) {
      case "P2002": {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[] | undefined)?.join(", ");
        message = target ? `${target} already exists.` : "That value already exists.";
        break;
      }
      case "P2025": {
        status = HttpStatus.NOT_FOUND;
        message = "The requested record was not found.";
        break;
      }
      case "P2003": {
        status = HttpStatus.BAD_REQUEST;
        message = "Related record does not exist.";
        break;
      }
    }

    response.status(status).json({ success: false, message });
  }
}
