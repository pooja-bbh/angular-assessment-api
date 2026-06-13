import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private readonly isProduction = environment.production;

  private readonly enabledLevels: ReadonlySet<LogLevel> = this.isProduction
    ? new Set<LogLevel>(['warn', 'error'])
    : new Set<LogLevel>(['debug', 'info', 'warn', 'error']);

  debug(context: string, message: string, data?: unknown): void {
    this.emit('debug', context, message, data);
  }

  info(context: string, message: string, data?: unknown): void {
    this.emit('info', context, message, data);
  }

  warn(context: string, message: string, data?: unknown): void {
    this.emit('warn', context, message, data);
  }

  error(context: string, message: string, data?: unknown): void {
    this.emit('error', context, message, data);
  }

  private emit(level: LogLevel, context: string, message: string, data?: unknown): void {
    if (!this.enabledLevels.has(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const head = `[${level.toUpperCase()}] [${timestamp}] [${context}] ${message}`;
    const line = data === undefined ? head : `${head} | ${this.stringify(data)}`;

    switch (level) {
      case 'debug':
        console.debug(line);
        break;
      case 'info':
        console.info(line);
        break;
      case 'warn':
        console.warn(line);
        break;
      case 'error':
        console.error(line);
        break;
    }
  }

  private stringify(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }
    try {
      return JSON.stringify(data);
    } catch {
      return String(data);
    }
  }
}
