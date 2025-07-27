import type { Metadata } from "next";
import { Space_Grotesk, Josefin_Sans } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const josefinSans = Josefin_Sans({
  variable: "--font-josefin-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "IPO Dalal - Indian IPO Tracking Platform",
  description: "Comprehensive IPO tracking platform for Indian investors with real-time GMP data, subscription tracking, and investment insights.",
  keywords: "IPO, India, GMP, Grey Market Premium, Investment, Stock Market, NSE, BSE",
  authors: [{ name: "IPO Dalal" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${josefinSans.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
