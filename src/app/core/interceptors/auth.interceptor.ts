import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggingService } from '../services/logging.service';

const CONTEXT = 'AuthInterceptor';

/**
 * Mock auth token. In production this would be supplied by an auth service and
 * never hardcoded or read from `localStorage` (security.md) — this fixed value
 * exists only to exercise the interceptor against the local mock API.
 */
const MOCK_AUTH_TOKEN = 'mock-jwt-token';

/**
 * Functional HTTP interceptor (Angular 17+ `HttpInterceptorFn`).
 *
 * Attaches `Authorization: Bearer <token>` only to requests targeting our own API
 * (`environment.apiBaseUrl`) so the token is never leaked to third-party origins.
 * Logs the outgoing request and any failure via `LoggingService` — never the token
 * or headers — and rethrows all errors without swallowing them.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggingService);

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const outgoing = isApiRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${MOCK_AUTH_TOKEN}` } })
    : req;

  // Log method + URL only — the Authorization header must never be logged.
  logger.info(CONTEXT, 'Outgoing request', { method: req.method, url: req.url });

  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 0) {
          logger.error(CONTEXT, 'Network error', { status: error.status, url: req.url });
        } else {
          logger.warn(CONTEXT, 'Non-2xx response', { status: error.status, url: req.url });
        }
      } else {
        logger.error(CONTEXT, 'Unexpected request error', { url: req.url });
      }
      // Never swallow — rethrow for the service / global ErrorHandler to handle.
      return throwError(() => error);
    }),
  );
};
