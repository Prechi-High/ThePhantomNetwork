"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/monitoring/client-report";

export function ClientErrorReporter() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      reportClientError({
        area: "client",
        message: event.message || "Uncaught error",
        stack: event.error?.stack,
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
        severity: "high",
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      reportClientError({
        area: "client",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
        context: { type: "unhandledrejection" },
        severity: "high",
      });
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      try {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : args[0] instanceof Request
              ? args[0].url
              : "";

        if (!response.ok && url.includes("/api/")) {
          const clone = response.clone();
          let body: Record<string, unknown> = {};
          try {
            body = await clone.json();
          } catch {
            body = {};
          }
          reportClientError({
            area: url.includes("/admin") ? "admin" : "api",
            message: (body.error as string) ?? `API ${response.status}: ${url}`,
            context: {
              statusCode: response.status,
              url,
              method: args[1]?.method ?? "GET",
              body,
            },
            severity: response.status >= 500 ? "critical" : "medium",
            url,
          });
        }
      } catch {
        // ignore monitor failures
      }
      return response;
    };

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
