import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NotificationProvider } from "@/components/ui/NotificationProvider";
import { TelegramProvider } from "@/components/providers/TelegramProvider";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
export const metadata: Metadata = {
  title: "LEGACIES",
  description: "Build your Legacy through strategy, rivalry, and triumph",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="min-h-screen antialiased">
        {/* Telegram SDK must be loaded in body for App Router */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        <TelegramProvider>
          <NotificationProvider>{children}</NotificationProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
