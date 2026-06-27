import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

/**
 * Wraps every successful controller return in `{ success, message, data }`.
 * A handler may return `{ message, data }` to set its own message; otherwise the
 * payload becomes `data` with a generic message. The frontend services unwrap `.data`.
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((payload): ApiResponse<T> => {
        if (
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          "message" in payload
        ) {
          const { data, message } = payload as {
            data: T;
            message: string;
          };
          return { success: true, message, data };
        }
        return { success: true, message: "OK", data: payload };
      }),
    );
  }
}
