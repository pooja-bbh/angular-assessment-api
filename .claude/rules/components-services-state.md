# Components, Services & State Rules

## Smart Component Rules
- Own and manage signals/state relevant to their subtree.
- Call services to fetch or mutate data.
- Pass data down to dumb children via `input()` signal inputs.
- Handle events emitted up from children via `output()` signal outputs.

## Dumb Component Rules
- Receive all data via `input()` signal inputs — never the `@Input()` decorator.
- Communicate up only via `output()` signal outputs — never `@Output()`.
- A dumb component must never modify a value passed in via `input()` — inputs are read-only; request changes via an `output()` event.

## Services
- Every service must use `@Injectable({ providedIn: 'root' })` — never provide a service in a component.
- Every service must use `inject()` for all dependencies — never use constructor injection.
- A service must never import from a component — services are consumed by components, never the reverse.
- A service must never directly manipulate the DOM — use a directive or Angular's renderer APIs for that.
- Never call `console.log`, `console.warn`, or `console.error` from a service — use `LoggingService`.
- One service per domain, in its own file.
- No UI code or UI-related state in service files.
- All HTTP calls must be made inside the service using `HttpClient` — never the `fetch` or `XHR` API.
- Don't swallow HTTP errors — instead throw a clean error.

## State
- Use `signal` for state management instead of NgRx, in all the services.
- Use `aria` attributes in all UI elements.
