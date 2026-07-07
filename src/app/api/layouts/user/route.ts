import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { validateLayout } from "@/lib/validation/layoutValidation";
import { createdResponse, noContent } from "@/app/api/layouts/_lib/responseBuilder";
import { handleApiError, ValidationError } from "@/app/api/layouts/_lib/errorHandler";
import type { LayoutConfig, PostUserLayoutResponse } from "@/lib/types/layout";

/**
 * POST /api/layouts/user
 *
 * Save or update the user's private layout.
 *
 * Flow:
 * 1. Verify authentication
 * 2. Parse and validate layout JSON
 * 3. Deactivate user's previous layouts (set is_active = false)
 * 4. Insert new layout record with is_active = true
 * 5. Set updated_at = NOW()
 *
 * Response (201 Created):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "layoutId": "uuid-here",
 *     "message": "Layout saved successfully"
 *   }
 * }
 * ```
 *
 * Auth: Required (401 if not authenticated)
 * Validation: 400 if layout JSON is invalid
 * Errors: 500 on database error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Verify authentication
    const userId = await requireAuth();

    // Step 2: Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (err) {
      throw new ValidationError("Invalid JSON body");
    }

    if (!body || typeof body !== "object") {
      throw new ValidationError("Request body must be an object");
    }

    const bodyObj = body as Record<string, unknown>;
    const layoutData = bodyObj.layout;

    if (!layoutData) {
      throw new ValidationError("Missing 'layout' field in request body");
    }

    // Step 3: Validate layout structure and content
    const validatedLayout = validateLayout(layoutData);

    // Step 4: Create admin client for database operations
    const admin = createAdminClient();

    // Step 5: Deactivate user's previous active layouts
    // (This ensures only one active layout per user)
    const { error: deactivateError } = await admin
      .from("user_layouts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (deactivateError) {
      console.error("[POST /api/layouts/user] Error deactivating old layouts:", deactivateError);
      throw new Error("Failed to deactivate previous layouts");
    }

    // Step 6: Insert new layout record
    const { data: insertedLayout, error: insertError } = await admin
      .from("user_layouts")
      .insert({
        user_id: userId,
        layout_json: validatedLayout as LayoutConfig,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[POST /api/layouts/user] Error inserting layout:", insertError);
      throw new Error("Failed to save layout to database");
    }

    if (!insertedLayout?.id) {
      throw new Error("Layout created but ID not returned");
    }

    // Step 7: Return success response with layoutId
    const response: PostUserLayoutResponse = {
      success: true,
      layoutId: insertedLayout.id,
      message: "Layout saved successfully",
    };

    return createdResponse(response);
  } catch (error) {
    return handleApiError(error, "POST /api/layouts/user");
  }
}

/**
 * DELETE /api/layouts/user
 *
 * Delete user's private layout (reset to global).
 *
 * Flow:
 * 1. Verify authentication
 * 2. Set is_active = false for user's layouts (soft delete)
 *    OR hard delete from database
 * 3. User will now use global layout
 *
 * Response (204 No Content or 200 OK):
 * Empty body (204) or { success: true } (200)
 *
 * Auth: Required (401 if not authenticated)
 * Note: Safe to call multiple times (idempotent)
 * Errors: 500 on database error
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Verify authentication
    const userId = await requireAuth();

    // Step 2: Create admin client for database operations
    const admin = createAdminClient();

    // Step 3: Soft delete - set is_active = false for all user layouts
    // This preserves the layout record for potential recovery
    // Alternative: hard delete with .delete().eq("user_id", userId)
    const { error: deleteError } = await admin
      .from("user_layouts")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (deleteError) {
      console.error("[DELETE /api/layouts/user] Error resetting layout:", deleteError);
      throw new Error("Failed to reset layout");
    }

    // Step 4: Return 204 No Content
    // This indicates successful deletion with no response body
    return noContent();
  } catch (error) {
    return handleApiError(error, "DELETE /api/layouts/user");
  }
}
