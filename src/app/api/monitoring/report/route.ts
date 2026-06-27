import { NextResponse } from "next/server";
import { captureError } from "@/lib/monitoring/capture";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.message) {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    await captureError({
      severity: body.severity,
      area: body.area ?? "client",
      message: body.message,
      stack: body.stack,
      cause: body.cause,
      context: {
        ...(body.context ?? {}),
        userAgent: request.headers.get("user-agent"),
      },
      url: body.url ?? request.headers.get("referer"),
      userId: body.userId ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report failed" },
      { status: 500 }
    );
  }
}
