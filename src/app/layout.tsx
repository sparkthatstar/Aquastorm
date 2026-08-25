import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AquaStorm",
  description: "Fresh water, delivered fast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
