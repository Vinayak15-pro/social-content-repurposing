import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepurposeIQ — Social Content Repurposing Pipeline",
  description: "Transform approved blog posts, case studies, and product pages into high-impact social content with source-fact traceability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
