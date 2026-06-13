export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly statusCode?: number;
}
