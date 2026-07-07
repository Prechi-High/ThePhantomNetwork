import { NextResponse } from "next/server";

/**
 * Unified error response handler for layout API endpoints.
 * Maps various error types to appropriate HTTP status codes and formats.
 * Logs errors server-side but doesn't expose stack traces to clients.
 * 
 * @param error - The error object to handle
 * @param context - String describing where the error occurred (e.g., "POST /api/layouts/user")
 * @returns NextResponse with proper JSON structure and HTTP status
 */
export function handleApiError(error: unknown, context: string): NextResponse {
  // Default error response
  let statusCode = 500;
  let message = "Internal server error";
  let details: Record<string, unknown> | undefined;

  // Handle custom errors with status codes
  if (error instanceof ValidationError) {
    statusCode = 400;
    message = error.message;
    details = error.details;
  } else if (error instanceof AuthenticationError) {
    statusCode = 401;
    message = error.message;
  } else if (error instanceof AuthorizationError) {
    statusCode = 403;
    message = error.message;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
    message = error.message;
  } else if (error instanceof ConflictError) {
    statusCode = 409;
    message = error.message;
  } else if (error instanceof RateLimitError) {
    statusCode = 429;
    message = error.message;
  } else if (error instanceof ServiceUnavailableError) {
    statusCode = 503;
    message = error.message;
  }

  // Handle standard Error class
  if (error instanceof Error) {
    // Log full error server-side for debugging
    console.error(`[Layout API - ${context}] Error:`, {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    // Handle unknown error types
    console.error(`[Layout API - ${context}] Unknown error:`, error);
  }

  // Build response object
  const responseBody: Record<string, unknown> = {
    success: false,
    error: message,
    statusCode,
  };

  // Include details if available (e.g., validation errors)
  if (details) {
    responseBody.details = details;
  }

  return NextResponse.json(responseBody, { status: statusCode });
}

/**
 * Custom error classes for different failure scenarios
 */

export class ValidationError extends Error {
  constructor(
    public message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(public message: string = "Unauthorized") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(public message: string = "Forbidden") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class NotFoundError extends Error {
  constructor(public message: string = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  constructor(public message: string = "Conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends Error {
  constructor(public message: string = "Rate limit exceeded") {
    super(message);
    this.name = "RateLimitError";
  }
}

export class ServiceUnavailableError extends Error {
  constructor(public message: string = "Service unavailable") {
    super(message);
    this.name = "ServiceUnavailableError";
  }
}

/**
 * Type guard to check if error is one of our custom errors
 */
export function isApiError(
  error: unknown
): error is ValidationError | AuthenticationError | AuthorizationError | NotFoundError {
  return (
    error instanceof ValidationError ||
    error instanceof AuthenticationError ||
    error instanceof AuthorizationError ||
    error instanceof NotFoundError ||
    error instanceof ConflictError ||
    error instanceof RateLimitError ||
    error instanceof ServiceUnavailableError
  );
}
