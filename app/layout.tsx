import type { Metadata } from "next";
import "./globals.css";
import { zh } from "@/lib/messages/zh";

export const metadata: Metadata = {
  title: zh.appName,
  description: "家庭协作任务管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
