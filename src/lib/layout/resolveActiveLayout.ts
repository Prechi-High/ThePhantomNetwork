import { createAdminClient } from "@/lib/supabase/admin";
import type { LayoutStatus, LayoutConfig } from "@/lib/types/layout";

/**
 * System default layout used when no user or global layout is active.
 * Empty components with version 1.0.
 */
export const SYSTEM_DEFAULT_LAYOUT: LayoutConfig = {
  components: {},
  version: "1.0.0",
  metadata: {
    createdAt: new Date(0).toISOString(),
    createdBy: "system",
  },
};

/**
 * Resolves the active layout for a user following priority order:
 * 1. User's private layout (if exists and is_active = true)
 * 2. Global layout (if exists and is_active = true)
 * 3. System default layout
 * 
 * Handles edge cases:
 * - Multiple private layouts (shouldn't happen but deactivates all except first)
 * - Missing rows returns default
 * - Database errors returns default with error flag
 * 
 * @param userId - User ID (UUID string)
 * @returns LayoutStatus with resolved layout and metadata
 */
export async function resolveActiveLayout(userId: string): Promise<LayoutStatus> {
  const admin = createAdminClient();

  try {
    // Step 1: Check for user's active private layout
    const { data: userLayouts, error: userError } = await admin
      .from("user_layouts")
      .select("id, layout_json, updated_at")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("updated_at", { ascending: false });

    if (userError) {
      console.error("[resolveActiveLayout] Error fetching user layouts:", userError);
      // Fall through to global layout
    }

    if (userLayouts && userLayouts.length > 0) {
      // If multiple active layouts exist, deactivate all except first
      if (userLayouts.length > 1) {
        const idsToDeactivate = userLayouts.slice(1).map((l) => l.id);
        await admin
          .from("user_layouts")
          .update({ is_active: false })
          .in("id", idsToDeactivate);
      }

      const layout = userLayouts[0].layout_json as LayoutConfig;
      return {
        source: "private",
        layout,
        metadata: {
          lastUpdated: userLayouts[0].updated_at,
        },
      };
    }

    // Step 2: Check for active global layout
    const { data: globalLayouts, error: globalError } = await admin
      .from("global_layouts")
      .select("id, version, layout_json, published_by, published_at, is_active")
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1);

    if (globalError) {
      console.error("[resolveActiveLayout] Error fetching global layouts:", globalError);
      // Fall through to default
    }

    if (globalLayouts && globalLayouts.length > 0) {
      const globalLayout = globalLayouts[0];
      const layout = globalLayout.layout_json as LayoutConfig;

      return {
        source: "global",
        layout,
        metadata: {
          version: globalLayout.version,
          versionLabel: `v${globalLayout.version}`,
          lastUpdated: globalLayout.published_at,
          publishedBy: globalLayout.published_by,
        },
      };
    }

    // Step 3: Return system default
    return {
      source: "default",
      layout: SYSTEM_DEFAULT_LAYOUT,
      metadata: {
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("[resolveActiveLayout] Unexpected error:", error);
    // Return default on any unexpected error
    return {
      source: "default",
      layout: SYSTEM_DEFAULT_LAYOUT,
      metadata: {
        lastUpdated: new Date().toISOString(),
      },
    };
  }
}

/**
 * Gets the username for a given user ID (for display purposes)
 * Used to populate metadata.publishedBy in layout responses
 * 
 * @param userId - User ID (UUID string)
 * @returns Username or user ID fallback
 */
export async function getUsernameOrId(userId: string): Promise<string> {
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();

  if (error || !profile?.username) {
    return userId; // Fallback to ID if lookup fails
  }

  return profile.username;
}
