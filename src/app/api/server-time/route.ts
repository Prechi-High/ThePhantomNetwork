import { NextResponse } from "next/server";

/**
 * GET /api/server-time
 * Returns current server time for client clock synchronization
 *
 * No authentication required
 * Returns minimal response for fast transmission
 */
export async function GET() {
  return NextResponse.json(
    {
      server_time: new Date().toISOString(),
    },
    {
      // Cache for 1 second to reduce database load
      headers: {
        "Cache-Control": "public, max-age=1",
      },
    }
  );
}
