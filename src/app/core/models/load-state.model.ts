import { AppError } from './app-error.model';

/**
 * Discriminated union modelling the four states of any async operation.
 *
 * The `status` literal is the discriminant — narrowing on it gives type-safe
 * access to `data` (only in `success`) and `error` (only in `error`). This lets
 * every smart component render loading / success / error / empty without ad-hoc
 * boolean flags.
 */
export type LoadState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: AppError };

/** Convenience constructors so call sites never build the union shape by hand. */
export const LoadState = {
  idle: (): LoadState<never> => ({ status: 'idle' }),
  loading: (): LoadState<never> => ({ status: 'loading' }),
  success: <T>(data: T): LoadState<T> => ({ status: 'success', data }),
  error: (error: AppError): LoadState<never> => ({ status: 'error', error }),
} as const;
