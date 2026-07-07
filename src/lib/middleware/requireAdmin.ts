import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin permission middleware for API routes.
 * Verifies user has admin or platform_designer role.
 * 
 * @param userId - User ID (UUID string)
 * @throws Will throw 403 error if user is not admin/platform_designer
 * @returns true on success
 * 
 * Usage:
 * ```
 * const userId = await requireAuth();
 * await requireAdmin(userId);
 * ```
 */
export async function requireAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();

  const { data: profile, error } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    throw new AdminError("User profile not found", 404);
  }

  const adminRoles = ["admin", "platform_designer"];
  if (!adminRoles.includes(profile.role)) {
    throw new AdminError("Forbidden: Admin access required", 403);
  }

  return true;
}

/**
 * Custom error class for authorization failures
 */
export class AdminError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 403
  ) {
    super(message);
    this.name = "AdminError";
  }
}
