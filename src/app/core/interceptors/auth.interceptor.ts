import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoggingService } from '../services/logging.service';

const CONTEXT = 'AuthInterceptor';

const MOCK_AUTH_TOKEN = 'mock-jwt-token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggingService);

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const outgoing = isApiRequest
    ? req.clone({ setHeaders: { Authorization: `Bearer ${MOCK_AUTH_TOKEN}` } })
    : req;

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
      return throwError(() => error);
    }),
  );
};
