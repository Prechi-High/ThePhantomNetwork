"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/monitoring/client-report";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportClientError({
      area: "client",
      message: error.message,
      stack: error.stack,
      context: { digest: error.digest, boundary: "global-error" },
      severity: "critical",
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold">Application Error</h1>
          <p className="text-sm text-gray-400">{error.message}</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-black"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
