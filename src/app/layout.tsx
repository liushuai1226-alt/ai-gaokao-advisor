import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 高考志愿顾问",
  description: "会追问、会分析、敢说真话的 AI 高考志愿顾问",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
