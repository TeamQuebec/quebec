import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Quebec — Verify a fact, not the whole record",
    template: "%s · Quebec",
  },
  description:
    "Quebec lets you confirm a single fact about someone — their age, their name, that they have a verified identity — without ever exposing their full record.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${space.variable} ${jetbrains.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
