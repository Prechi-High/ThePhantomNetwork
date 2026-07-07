import { NextResponse } from "next/server";
import { requireAuth, AuthError } from "@/lib/middleware/requireAuth";
import { resolveActiveLayout } from "@/lib/layout/resolveActiveLayout";
import { successResponse } from "@/app/api/layouts/_lib/responseBuilder";
import { handleApiError } from "@/app/api/layouts/_lib/errorHandler";
import type { GetActiveLayoutResponse } from "@/lib/types/layout";

/**
 * GET /api/layouts/active
 *
 * Resolves and returns the user's active layout following priority order:
 * 1. User's private layout (if exists and is_active = true)
 * 2. Global layout (if exists and is_active = true)
 * 3. System default layout
 *
 * Response includes metadata about the layout source:
 * - version/versionLabel: For global layouts
 * - publishedBy: For global layouts (username)
 * - lastUpdated: ISO timestamp
 *
 * Auth: Required (401 if not authenticated)
 * Errors: Returns error with handleApiError
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Step 1: Verify authentication
    const userId = await requireAuth();

    // Step 2: Resolve active layout (private > global > default)
    const layoutStatus = await resolveActiveLayout(userId);

    // Step 3: Build response with proper type
    const response: GetActiveLayoutResponse = {
      source: layoutStatus.source,
      layout: layoutStatus.layout,
      metadata: layoutStatus.metadata,
    };

    // Step 4: Return success response
    return successResponse(response, 200);
  } catch (error) {
    // Handle errors with unified error handler
    return handleApiError(error, "GET /api/layouts/active");
  }
}
