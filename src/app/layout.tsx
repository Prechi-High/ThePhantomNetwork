import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { NotificationProvider } from "@/components/ui/NotificationProvider";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "THE PHANTOM",
  description: "A living competitive ecosystem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className="min-h-screen antialiased">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
