import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { validateLayout } from "@/lib/validation/layoutValidation";
import { createdResponse } from "@/app/api/layouts/_lib/responseBuilder";
import { handleApiError, ValidationError } from "@/app/api/layouts/_lib/errorHandler";
import type { LayoutConfig, PostGlobalLayoutResponse } from "@/lib/types/layout";

/**
 * POST /api/layouts/global
 *
 * Publish a new global layout (admin only).
 *
 * Flow:
 * 1. Verify authentication
 * 2. Verify user has admin or platform_designer role
 * 3. Validate layout JSON
 * 4. Get current active global layout (if any)
 * 5. Archive current active layout to global_layout_history
 * 6. Create new global layout record with:
 *    - version = MAX(version) + 1
 *    - is_active = true
 *    - published_by = auth.uid
 *    - published_at = NOW()
 *    - change_notes = request.changeNotes (optional)
 * 7. Return success response with new version number
 *
 * Request Body:
 * ```json
 * {
 *   "layout": { LayoutConfig },
 *   "changeNotes": "Updated UI positions"
 * }
 * ```
 *
 * Response (201 Created):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "layoutId": "uuid-here",
 *     "version": 3,
 *     "message": "Global layout published successfully (v3)"
 *   }
 * }
 * ```
 *
 * Auth: Required (401 if not authenticated)
 * Permission: Admin/platform_designer only (403 if not admin)
 * Validation: 400 if layout JSON is invalid
 * Errors: 500 on database error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Verify authentication
    const userId = await requireAuth();

    // Step 2: Verify admin permissions
    await requireAdmin(userId);

    // Step 3: Parse request body
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
    const changeNotes = typeof bodyObj.changeNotes === "string" ? bodyObj.changeNotes : undefined;

    if (!layoutData) {
      throw new ValidationError("Missing 'layout' field in request body");
    }

    // Step 4: Validate layout structure and content
    const validatedLayout = validateLayout(layoutData);

    // Step 5: Create admin client for database operations
    const admin = createAdminClient();

    // Step 6: Get current active global layout to archive it
    const { data: currentGlobalLayouts, error: fetchError } = await admin
      .from("global_layouts")
      .select("id, version, layout_json, published_by, published_at, change_notes")
      .eq("is_active", true)
      .limit(1);

    if (fetchError) {
      console.error("[POST /api/layouts/global] Error fetching current global layout:", fetchError);
      throw new Error("Failed to fetch current global layout");
    }

    let nextVersion = 1; // Default version for first global layout

    // Step 7: If there's a current active layout, archive it and increment version
    if (currentGlobalLayouts && currentGlobalLayouts.length > 0) {
      const currentLayout = currentGlobalLayouts[0];
      nextVersion = (currentLayout.version as number) + 1;

      // Archive the current layout to history
      const { error: archiveError } = await admin
        .from("global_layout_history")
        .insert({
          layout_id: currentLayout.id,
          version: currentLayout.version,
          layout_json: currentLayout.layout_json as LayoutConfig,
          published_by: currentLayout.published_by,
          published_at: currentLayout.published_at,
          change_notes: currentLayout.change_notes,
          archived_at: new Date().toISOString(),
          archived_by: userId,
        });

      if (archiveError) {
        console.error("[POST /api/layouts/global] Error archiving old layout:", archiveError);
        throw new Error("Failed to archive previous layout");
      }

      // Deactivate the current layout
      const { error: deactivateError } = await admin
        .from("global_layouts")
        .update({ is_active: false })
        .eq("id", currentLayout.id);

      if (deactivateError) {
        console.error("[POST /api/layouts/global] Error deactivating old layout:", deactivateError);
        throw new Error("Failed to deactivate previous layout");
      }
    }

    // Step 8: Insert new global layout record
    const { data: insertedLayout, error: insertError } = await admin
      .from("global_layouts")
      .insert({
        version: nextVersion,
        layout_json: validatedLayout as LayoutConfig,
        published_by: userId,
        published_at: new Date().toISOString(),
        change_notes: changeNotes,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("[POST /api/layouts/global] Error inserting new global layout:", insertError);
      throw new Error("Failed to publish global layout");
    }

    if (!insertedLayout?.id) {
      throw new Error("Layout published but ID not returned");
    }

    // Step 9: Return success response with version number
    const response: PostGlobalLayoutResponse = {
      success: true,
      version: nextVersion,
      layoutId: insertedLayout.id,
      message: `Global layout published successfully (v${nextVersion})`,
    };

    return createdResponse(response);
  } catch (error) {
    return handleApiError(error, "POST /api/layouts/global");
  }
}
