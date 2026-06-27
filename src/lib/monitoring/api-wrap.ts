import { NextResponse } from "next/server";
import { captureError } from "@/lib/monitoring/capture";
import type { ErrorArea } from "@/lib/monitoring/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorMonitoring<T extends any[]>(
  area: ErrorArea,
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T) => {
    const request = args[0] as Request;
    try {
      const response = await handler(...args);
      if (response.status >= 500) {
        const clone = response.clone();
        let body: Record<string, unknown> = {};
        try {
          body = await clone.json();
        } catch {
          body = {};
        }
        await captureError({
          area,
          message: (body.error as string) ?? `HTTP ${response.status}`,
          context: {
            statusCode: response.status,
            path: new URL(request.url).pathname,
            method: request.method,
            body,
          },
          url: request.url,
        });
      }
      return response;
    } catch (err) {
      await captureError({
        area,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        context: {
          path: new URL(request.url).pathname,
          method: request.method,
          statusCode: 500,
        },
        url: request.url,
      });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
