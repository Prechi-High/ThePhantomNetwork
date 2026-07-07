import { createClient } from "@/lib/supabase/server";

/**
 * Authentication middleware for API routes.
 * Verifies user is authenticated and returns their user ID.
 * 
 * @throws Will return 401 if user is not authenticated
 * @returns User ID (UUID string) on success
 * 
 * Usage:
 * ```
 * const userId = await requireAuth();
 * ```
 */
export async function requireAuth(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new AuthError("Unauthorized", 401);
  }

  return user.id;
}

/**
 * Custom error class for authentication failures
 */
export class AuthError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = "AuthError";
  }
}
