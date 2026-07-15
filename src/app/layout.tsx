import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DeveloperConsole from "@/components/ui/DeveloperConsole";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Taj Tyre Work - Premium 3D Tyre Business Management",
  description: "Comprehensive management system for Taj Tyre Works, featuring 3D showrooms, size recommendation finder, live garage service queues, GST invoices terminal, and cash book registries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DeveloperConsole />
      </body>
    </html>
  );
}
