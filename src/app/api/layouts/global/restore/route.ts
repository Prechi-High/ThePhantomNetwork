import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { createdResponse } from "@/app/api/layouts/_lib/responseBuilder";
import {
  handleApiError,
  ValidationError,
  NotFoundError,
} from "@/app/api/layouts/_lib/errorHandler";
import type { LayoutConfig, PostGlobalRestoreResponse } from "@/lib/types/layout";

/**
 * POST /api/layouts/global/restore
 *
 * Restore previous global layout version (admin only).
 *
 * Flow:
 * 1. Verify authentication
 * 2. Verify user has admin or platform_designer role
 * 3. Parse request body: { versionId: string, changeNotes?: string }
 * 4. Validate versionId is a valid UUID
 * 5. Fetch history record by versionId
 * 6. If not found: return 404
 * 7. Get current active global layout
 * 8. Archive current active layout to history table
 * 9. Copy selected history record to active global_layouts with:
 *    - version = (MAX(version) + 1)
 *    - is_active = true
 *    - published_by = current admin userId
 *    - published_at = NOW()
 *    - change_notes = optional from request, or "Restored from v{old_version}"
 *    - layout_json = from history record
 * 10. Return 201 with new version number
 *
 * Request Body:
 * ```json
 * {
 *   "versionId": "uuid-here",
 *   "changeNotes": "Reverting due to user feedback" // optional
 * }
 * ```
 *
 * Response (201 Created):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "newVersion": 4,
 *     "message": "Restored v2.1 as v2.4 (current active)"
 *   }
 * }
 * ```
 *
 * Auth: Required (401 if not authenticated)
 * Permission: Admin/platform_designer only (403 if not admin)
 * Validation: 400 if invalid versionId format
 * Not Found: 404 if versionId not found in history
 * Errors: 500 if database error
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
    const versionId = bodyObj.versionId;
    const changeNotes = typeof bodyObj.changeNotes === "string" ? bodyObj.changeNotes : undefined;

    // Step 4: Validate versionId is provided and is a valid UUID
    if (!versionId) {
      throw new ValidationError("Missing 'versionId' field in request body");
    }

    if (typeof versionId !== "string" || !isValidUuid(versionId)) {
      throw new ValidationError("Invalid versionId format. Must be a valid UUID");
    }

    // Step 5: Create admin client for database operations
    const admin = createAdminClient();

    // Step 6: Fetch history record by versionId
    const { data: historyRecord, error: historyError } = await admin
      .from("global_layout_history")
      .select("id, version, layout_json, published_by, published_at, change_notes")
      .eq("id", versionId)
      .single();

    if (historyError || !historyRecord) {
      console.error("[POST /api/layouts/global/restore] History record not found:", historyError);
      throw new NotFoundError(
        `Version with ID '${versionId}' not found in history`
      );
    }

    // Step 7: Get current active global layout
    const { data: currentLayouts, error: currentError } = await admin
      .from("global_layouts")
      .select("id, version, layout_json, published_by, published_at, change_notes")
      .eq("is_active", true)
      .limit(1);

    if (currentError) {
      console.error("[POST /api/layouts/global/restore] Error fetching current layout:", currentError);
      throw new Error("Failed to fetch current global layout");
    }

    let nextVersion = 1; // Default for first layout (shouldn't happen in restore)

    // Step 8: Archive current active layout to history (if one exists)
    if (currentLayouts && currentLayouts.length > 0) {
      const currentLayout = currentLayouts[0];
      nextVersion = (currentLayout.version as number) + 1;

      // Archive current active layout
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
        console.error("[POST /api/layouts/global/restore] Error archiving current layout:", archiveError);
        throw new Error("Failed to archive current layout");
      }

      // Deactivate current active layout
      const { error: deactivateError } = await admin
        .from("global_layouts")
        .update({ is_active: false })
        .eq("id", currentLayout.id);

      if (deactivateError) {
        console.error(
          "[POST /api/layouts/global/restore] Error deactivating current layout:",
          deactivateError
        );
        throw new Error("Failed to deactivate current layout");
      }
    }

    // Step 9: Copy selected history record to active global_layouts
    const restoredVersion = historyRecord.version as number;
    const restoreChangeNotes =
      changeNotes || `Restored from v${restoredVersion}`;

    const { error: insertError } = await admin
      .from("global_layouts")
      .insert({
        version: nextVersion,
        layout_json: historyRecord.layout_json as LayoutConfig,
        published_by: userId,
        published_at: new Date().toISOString(),
        change_notes: restoreChangeNotes,
        is_active: true,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("[POST /api/layouts/global/restore] Error inserting restored layout:", insertError);
      throw new Error("Failed to restore layout");
    }

    // Step 10: Return success response with new version number
    const response: PostGlobalRestoreResponse = {
      success: true,
      newVersion: nextVersion,
      message: `Restored v${restoredVersion} as v${nextVersion} (current active)`,
    };

    return createdResponse(response);
  } catch (error) {
    return handleApiError(error, "POST /api/layouts/global/restore");
  }
}

/**
 * Helper function to validate UUID format
 * Accepts both UUID v4 and general UUID format
 */
function isValidUuid(value: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}
