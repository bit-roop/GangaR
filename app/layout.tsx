import type { Metadata } from "next";
import { OperationalToastRegion } from "@/components/ui/OperationalToastRegion";
import "./globals.css";

export const metadata: Metadata = {
  title: "GangaRakshak AI",
  description: "Responsive landing dashboard inspired by the provided design."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <OperationalToastRegion />
      </body>
    </html>
  );
}
