# Error Handling Rules

## State Handling
- Every async operation must explicitly handle all three states — loading, success, and error — never leave any state unhandled.
- Errors must never silently fail — always surface meaningful feedback to the user.
- Never let an unhandled error crash the entire SPA silently.

## User-Facing Messages
- Error messages must be specific and actionable — never show a generic "An error occurred"; show something like "Failed to load policies. Check your connection and try again."
- Map HTTP status codes to these user-friendly messages:

  | Status | Message |
  | --- | --- |
  | `0` (network/offline) | "Can't reach the server. Check your connection and try again." |
  | `400` | "The request was invalid. Please adjust your filters and try again." |
  | `401` | "Your session has expired. Please sign in again." |
  | `403` | "You don't have permission to view this data." |
  | `404` | "The requested policies could not be found." |
  | `408` / timeout | "The request timed out. Please try again." |
  | `409` | "This action conflicts with the current data. Refresh and try again." |
  | `422` | "Some values were rejected. Please review your input and try again." |
  | `429` | "Too many requests. Please wait a moment and try again." |
  | `500`–`599` | "Something went wrong on our end. Please try again shortly." |

## Retry
- Always provide a retry mechanism for every recoverable error.
- The parent smart component must listen to the retry output and re-trigger the API call when it fires.

## Global Error Handling
- Implement a global `ErrorHandler` by providing a custom class for Angular's `ErrorHandler` token — this must catch any unhandled error, log it via `LoggingService`, and optionally show a toast notification.

## Validation
- Show inline validation errors using Angular Material's `mat-error` — never make an API call with invalid filter state.
