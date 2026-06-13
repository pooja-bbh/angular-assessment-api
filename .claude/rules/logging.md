# Logging Rules

## LoggingService
- Never call `console.log`, `console.warn`, or `console.error` directly from any component, service, or application code — all logging must go through `LoggingService`.
- `LoggingService` is the only class in the application that may write to the browser console.
- In development (`!environment.production`), write all log levels to the browser console.
- Structure every log line as a single formatted string: `[LEVEL] [timestamp] [context] message | data`.
- In the `HttpInterceptor`, log every outgoing request at `info` level including the HTTP method, URL, and response duration.

## Sensitive Data
- Never log full JWT tokens, auth headers, raw passwords, or any secrets.
- Never log full API response bodies in production — summarise the response instead.
- Never log personal data beyond policy number — do not log policyholder names or contact details.
- Never log full financial amounts in production — treat premium values as sensitive data.
