import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "One — Inseparable",
  description: "A real-time intimacy app for couples.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
