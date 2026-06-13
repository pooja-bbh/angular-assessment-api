import { AppError } from './app-error.model';

export type LoadState<T> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: AppError };

export const LoadState = {
  idle: (): LoadState<never> => ({ status: 'idle' }),
  loading: (): LoadState<never> => ({ status: 'loading' }),
  success: <T>(data: T): LoadState<T> => ({ status: 'success', data }),
  error: (error: AppError): LoadState<never> => ({ status: 'error', error }),
} as const;
