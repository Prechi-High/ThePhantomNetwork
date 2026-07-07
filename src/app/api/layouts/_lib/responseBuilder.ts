import { NextResponse } from "next/server";

/**
 * Unified success response builder for layout API endpoints.
 * Provides consistent JSON structure and content-type headers across all responses.
 * 
 * All responses follow the pattern:
 * - { success: true, data: ... }
 * - { success: true, message: ... }
 * - Proper Content-Type: application/json
 * - Configurable HTTP status codes
 */

/**
 * Build a success response with data payload
 * 
 * @param data - The data object to include in response
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with { success: true, data: ... }
 * 
 * @example
 * ```
 * const response = successResponse({ layoutId: "123", saved: true });
 * return response; // status 200
 * ```
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Build a success response with message only (no data payload)
 * 
 * @param message - The message string to include
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with { success: true, message: ... }
 * 
 * @example
 * ```
 * const response = successMessage("Layout deleted successfully");
 * return response; // status 200
 * ```
 */
export function successMessage(message: string, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Build a 201 Created response for resource creation
 * 
 * @param data - The created resource data
 * @returns NextResponse with status 201 and { success: true, data: ... }
 * 
 * @example
 * ```
 * const response = createdResponse({ id: "new-layout-id", version: 1 });
 * return response; // status 201
 * ```
 */
export function createdResponse<T>(data: T): NextResponse {
  return successResponse(data, 201);
}

/**
 * Build a 204 No Content response
 * Used for successful operations with no response body (e.g., DELETE)
 * 
 * @returns NextResponse with status 204 and empty body
 * 
 * @example
 * ```
 * const response = noContent();
 * return response; // status 204, empty body
 * ```
 */
export function noContent(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Build a paginated response with metadata
 * 
 * @param data - Array of items
 * @param pagination - Pagination metadata (total, page, pageSize, etc.)
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with { success: true, data: [...], pagination: {...} }
 * 
 * @example
 * ```
 * const response = paginatedResponse(versions, { total: 50, page: 1, pageSize: 10 });
 * return response;
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: Record<string, unknown>,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      pagination,
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Build a response with metadata (e.g., layout status info)
 * 
 * @param data - Main data object
 * @param metadata - Additional metadata object
 * @param status - HTTP status code (defaults to 200)
 * @returns NextResponse with { success: true, data: {...}, metadata: {...} }
 * 
 * @example
 * ```
 * const response = metadataResponse(layout, { version: 2, lastUpdated: "2024-01-15T..." });
 * return response;
 * ```
 */
export function metadataResponse<T extends Record<string, unknown>>(
  data: T,
  metadata: Record<string, unknown>,
  status: number = 200
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data: {
        ...data,
        metadata,
      },
    },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
