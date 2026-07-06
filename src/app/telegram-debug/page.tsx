"use client";

import { useEffect, useState } from "react";
import { useTelegram } from "@/components/providers/TelegramProvider";
import { TelegramSDK } from "@/lib/telegram/TelegramSDK";
import { Card } from "@/components/ui/Card";

export default function TelegramDebugPage() {
  const { webApp, status, isLoading, isInTelegram } = useTelegram();
  const [logs, setLogs] = useState<string[]>([]);
  const [rawWindow, setRawWindow] = useState<any>(null);

  useEffect(() => {
    const sdk = TelegramSDK.getInstance();
    setLogs(sdk.getLogs());
    
    if (typeof window !== "undefined") {
      setRawWindow({
        hasTelegram: !!window.Telegram,
        hasWebApp: !!window.Telegram?.WebApp,
        initData: window.Telegram?.WebApp?.initData || null,
        platform: window.Telegram?.WebApp?.platform || null,
        version: window.Telegram?.WebApp?.version || null,
      });
    }
  }, [isLoading]);

  return (
    <div className="min-h-screen bg-phantom-black p-4">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold text-phantom-gold">
          Telegram Mini App Diagnostics
        </h1>

        {/* Status Overview */}
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-phantom-gold">Status Overview</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <StatusItem label="Loading" value={isLoading} />
            <StatusItem label="SDK Loaded" value={status.sdkLoaded} />
            <StatusItem label="Telegram Detected" value={status.telegramDetected} />
            <StatusItem label="InitData Available" value={status.initDataAvailable} />
            <StatusItem label="Is In Telegram" value={isInTelegram} />
          </div>
          {status.error && (
            <div className="mt-2 rounded bg-red-900/30 p-2 text-sm text-red-400">
              <strong>Error:</strong> {status.error}
            </div>
          )}
        </Card>

        {/* Telegram Info */}
        {webApp && (
          <Card className="space-y-2">
            <h2 className="text-xl font-bold text-phantom-gold">Telegram WebApp Info</h2>
            <div className="space-y-1 text-sm">
              <InfoRow label="Platform" value={webApp.platform} />
              <InfoRow label="Version" value={webApp.version} />
              <InfoRow label="Color Scheme" value={webApp.colorScheme} />
              <InfoRow label="Viewport Height" value={webApp.viewportHeight} />
              <InfoRow label="Is Expanded" value={webApp.isExpanded} />
              <InfoRow label="InitData Length" value={webApp.initData?.length || 0} />
            </div>
          </Card>
        )}

        {/* User Info */}
        {status.userId && (
          <Card className="space-y-2">
            <h2 className="text-xl font-bold text-phantom-gold">User Info</h2>
            <div className="space-y-1 text-sm">
              <InfoRow label="User ID" value={status.userId} />
              <InfoRow label="Username" value={status.username || "none"} />
              <InfoRow label="First Name" value={status.firstName || "none"} />
              <InfoRow label="Is Premium" value={status.isPremium || false} />
            </div>
          </Card>
        )}

        {/* InitData */}
        {webApp?.initData && (
          <Card className="space-y-2">
            <h2 className="text-xl font-bold text-phantom-gold">InitData</h2>
            <div className="overflow-x-auto rounded bg-phantom-gray-900 p-2">
              <code className="text-xs text-phantom-muted break-all">
                {webApp.initData}
              </code>
            </div>
          </Card>
        )}

        {/* Raw Window Object */}
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-phantom-gold">Raw Window.Telegram</h2>
          <div className="overflow-x-auto rounded bg-phantom-gray-900 p-2">
            <pre className="text-xs text-phantom-muted">
              {JSON.stringify(rawWindow, null, 2)}
            </pre>
          </div>
        </Card>

        {/* Initialization Logs */}
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-phantom-gold">
            Initialization Logs ({logs.length})
          </h2>
          <div className="max-h-96 overflow-y-auto rounded bg-phantom-gray-900 p-2">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`text-xs font-mono ${
                  log.includes("ERROR")
                    ? "text-red-400"
                    : log.includes("WARNING")
                    ? "text-yellow-400"
                    : log.includes("✅")
                    ? "text-green-400"
                    : "text-phantom-muted"
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-phantom-gold">Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => {
                const sdk = TelegramSDK.getInstance();
                setLogs(sdk.getLogs());
              }}
              className="rounded bg-phantom-gold px-4 py-2 text-sm font-bold text-phantom-black hover:bg-phantom-gold/80"
            >
              Refresh Logs
            </button>
            <button
              onClick={() => {
                window.location.reload();
              }}
              className="ml-2 rounded bg-phantom-gray-700 px-4 py-2 text-sm font-bold text-phantom-white hover:bg-phantom-gray-600"
            >
              Reload Page
            </button>
          </div>
        </Card>

        {/* Instructions */}
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-phantom-gold">Troubleshooting</h2>
          <div className="space-y-2 text-sm text-phantom-muted">
            <p>
              <strong className="text-phantom-white">If SDK not loaded:</strong> The
              Telegram script failed to load. Check network tab for 404 errors.
            </p>
            <p>
              <strong className="text-phantom-white">If Telegram not detected:</strong>{" "}
              window.Telegram.WebApp is undefined. Script may be blocked by CSP or
              failed to initialize.
            </p>
            <p>
              <strong className="text-phantom-white">If no initData:</strong> App is not
              opened as a Telegram Mini App. Must be launched from Telegram bot menu.
            </p>
            <p>
              <strong className="text-phantom-white">To test properly:</strong> Open
              this URL in Telegram Desktop/Mobile via your bot's menu button.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center justify-between rounded bg-phantom-gray-900 px-3 py-2">
      <span className="text-phantom-muted">{label}</span>
      <span
        className={`font-bold ${value ? "text-green-400" : "text-red-400"}`}
      >
        {value ? "✓ YES" : "✗ NO"}
      </span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between border-b border-phantom-gray-800 py-1">
      <span className="text-phantom-muted">{label}</span>
      <span className="font-mono text-phantom-white">
        {typeof value === "object" ? JSON.stringify(value) : String(value)}
      </span>
    </div>
  );
}
