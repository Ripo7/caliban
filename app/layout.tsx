import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Asteroid Roulette",
  description: "Every near-Earth object passing today, filed without comment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
