export type ErrorSeverity = "critical" | "high" | "medium" | "low";

export type ErrorArea =
  | "auth"
  | "api"
  | "gameplay"
  | "session"
  | "payment"
  | "admin"
  | "client"
  | "shop"
  | "wallet"
  | "cron"
  | "monitoring"
  | "unknown";

export interface ErrorReportInput {
  severity?: ErrorSeverity;
  area: ErrorArea | string;
  message: string;
  stack?: string | null;
  cause?: string | null;
  context?: Record<string, unknown>;
  url?: string | null;
  userId?: string | null;
  requestId?: string | null;
}

export interface AppErrorRow {
  id: string;
  severity: ErrorSeverity;
  area: string;
  message: string;
  stack: string | null;
  cause: string | null;
  context: Record<string, unknown>;
  url: string | null;
  user_id: string | null;
  request_id: string | null;
  resolved: boolean;
  created_at: string;
}

export function inferSeverity(
  area: string,
  message: string,
  statusCode?: number
): ErrorSeverity {
  const msg = message.toLowerCase();
  if (
    area === "payment" ||
    area === "cron" ||
    msg.includes("payout") ||
    msg.includes("stripe")
  ) {
    return "critical";
  }
  if (statusCode && statusCode >= 500) return "critical";
  if (area === "gameplay" || area === "session" || area === "auth") {
    return statusCode && statusCode >= 400 ? "high" : "high";
  }
  if (statusCode && statusCode >= 400) return "medium";
  if (msg.includes("warning") || msg.includes("validation")) return "low";
  return "medium";
}
