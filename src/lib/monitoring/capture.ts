import { createAdminClient } from "@/lib/supabase/admin";
import { inferSeverity, type ErrorReportInput } from "./types";

function serializeError(err: unknown): { message: string; stack?: string; cause?: string } {
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
      cause: err.cause instanceof Error ? err.cause.message : String(err.cause ?? ""),
    };
  }
  return { message: String(err) };
}

export async function captureError(input: ErrorReportInput) {
  try {
    const admin = createAdminClient();
    const severity =
      input.severity ?? inferSeverity(input.area, input.message, input.context?.statusCode as number);

    await admin.from("app_errors").insert({
      severity,
      area: input.area,
      message: input.message.slice(0, 4000),
      stack: input.stack?.slice(0, 8000) ?? null,
      cause: input.cause?.slice(0, 2000) ?? null,
      context: input.context ?? {},
      url: input.url ?? null,
      user_id: input.userId ?? null,
      request_id: input.requestId ?? null,
    });
  } catch {
    // Never throw from monitoring
  }
}

export async function captureException(
  area: ErrorReportInput["area"],
  err: unknown,
  extra?: Partial<ErrorReportInput>
) {
  const { message, stack, cause } = serializeError(err);
  await captureError({
    area,
    message,
    stack,
    cause,
    ...extra,
  });
}

export function captureErrorSync(input: ErrorReportInput) {
  captureError(input).catch(() => {});
}

export function captureExceptionSync(
  area: ErrorReportInput["area"],
  err: unknown,
  extra?: Partial<ErrorReportInput>
) {
  captureException(area, err, extra).catch(() => {});
}
