"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import I18nProvider from "@/components/I18nProvider";
import { useEffect } from "react";
import api from "@/lib/api";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Auto check backend on app load
    api.get("/")
      .then(() => console.log("Backend connected"))
      .catch(() => console.warn("Backend not running"));
  }, []);

  return (
    <html lang="en">
      <head>
        <title>MediAI</title>
        <meta name="description" content="AI Powered Healthcare Assistant" />
        <link rel="icon" href="/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider>
            {children}
        </I18nProvider>
      </body>
    </html>
  );
}
