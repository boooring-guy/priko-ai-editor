import type { Metadata } from "next";
import { Google_Sans, Inter, JetBrains_Mono } from "next/font/google";
import "@fontsource-variable/mona-sans";
import { GlobalShortcuts } from "@/components/global-shortcuts";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "../components/providers";
import "./globals.css";

const googleSans = Google_Sans({
  variable: "--font-google-sans",
  subsets: ["latin"],
  fallback: ["sans-serif"],
});

const JetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const linearInter = Inter({
  variable: "--font-linear",
  subsets: ["latin"],
  fallback: ["sans-serif"],
});

export const metadata: Metadata = {
  title: "PriKo",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${googleSans.className} ${linearInter.variable} ${JetBrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GlobalShortcuts />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
