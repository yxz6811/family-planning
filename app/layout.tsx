import type { Metadata } from "next";
import { Baloo_2, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import { zh } from "@/lib/messages/zh";

const headingFont = Baloo_2({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

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
      <body
        className={`${headingFont.variable} ${bodyFont.variable} font-body min-h-screen antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
