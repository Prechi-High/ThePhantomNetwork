import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireAdmin } from "@/lib/middleware/requireAdmin";
import { successResponse } from "@/app/api/layouts/_lib/responseBuilder";
import { handleApiError, NotFoundError } from "@/app/api/layouts/_lib/errorHandler";
import { getUsernameOrId } from "@/lib/layout/resolveActiveLayout";
import type { GetGlobalHistoryResponse, GlobalLayoutVersionInfo } from "@/lib/types/layout";

/**
 * GET /api/layouts/global/history
 *
 * Retrieve global layout version history (admin only).
 *
 * Flow:
 * 1. Verify authentication
 * 2. Verify user has admin or platform_designer role
 * 3. Query global_layout_history table ordered by version DESC
 * 4. LIMIT to 100 most recent versions
 * 5. Map results to version info objects
 * 6. Fetch usernames for publishedBy display
 * 7. Return success response with version array
 *
 * Response (200 OK):
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "versions": [
 *       {
 *         "id": "uuid-here",
 *         "version": 3,
 *         "versionLabel": "v3",
 *         "publishedBy": "admin-username",
 *         "publishedAt": "2025-01-15T10:30:00Z",
 *         "changeNotes": "Moved buttons to bottom"
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Auth: Required (401 if not authenticated)
 * Permission: Admin/platform_designer only (403 if not admin)
 * Errors: 500 if database error
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Step 1: Verify authentication
    const userId = await requireAuth();

    // Step 2: Verify admin permissions
    await requireAdmin(userId);

    // Step 3: Create admin client for database operations
    const admin = createAdminClient();

    // Step 4: Query global layout history ordered by version DESC, LIMIT 100
    const { data: historyRecords, error: queryError } = await admin
      .from("global_layout_history")
      .select("id, version, published_by, published_at, change_notes")
      .order("version", { ascending: false })
      .limit(100);

    if (queryError) {
      console.error("[GET /api/layouts/global/history] Error querying history:", queryError);
      throw new Error("Failed to fetch layout history");
    }

    // If no records, return empty array (not an error)
    if (!historyRecords || historyRecords.length === 0) {
      const response: GetGlobalHistoryResponse = {
        versions: [],
      };
      return successResponse(response);
    }

    // Step 5: Map history records to version info objects
    // Build a set of unique user IDs to fetch usernames
    const userIds = new Set<string>();
    historyRecords.forEach((record) => {
      userIds.add(record.published_by as string);
    });

    // Step 6: Fetch usernames for all publishers
    const usernameMap = new Map<string, string>();
    for (const uid of userIds) {
      const username = await getUsernameOrId(uid);
      usernameMap.set(uid, username);
    }

    // Step 7: Build version info array
    const versions: GlobalLayoutVersionInfo[] = historyRecords.map((record) => ({
      id: record.id as string,
      version: record.version as number,
      versionLabel: `v${record.version}`,
      publishedBy: usernameMap.get(record.published_by as string) || (record.published_by as string),
      publishedAt: record.published_at as string,
      changeNotes: (record.change_notes as string | null) ?? undefined,
    }));

    // Step 8: Return success response
    const response: GetGlobalHistoryResponse = {
      versions,
    };

    return successResponse(response);
  } catch (error) {
    return handleApiError(error, "GET /api/layouts/global/history");
  }
}
