import type { ErrorReportInput } from "./types";

export async function reportClientError(input: Omit<ErrorReportInput, "area"> & { area?: string }) {
  try {
    await fetch("/api/monitoring/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        area: input.area ?? "client",
        message: input.message,
        stack: input.stack,
        cause: input.cause,
        context: input.context,
        url: input.url ?? (typeof window !== "undefined" ? window.location.href : undefined),
        severity: input.severity,
      }),
    });
  } catch {
    // silent
  }
}
