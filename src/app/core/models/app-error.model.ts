/**
 * Normalised application error surfaced to the UI layer.
 *
 * Services translate raw transport failures (e.g. `HttpErrorResponse`) into this
 * shape so components never depend on HTTP internals and never expose stack traces.
 */
export interface AppError {
  /** Stable, machine-readable identifier for the error condition. */
  readonly code: string;
  /** User-facing, actionable message — already mapped from the status code. */
  readonly message: string;
  /** Originating HTTP status code, when the error came from an HTTP response. */
  readonly statusCode?: number;
}
