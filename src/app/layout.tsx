import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/providers/auth-provider";
import { FloatingChatWrapper } from "@/components/career/FloatingChatWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Placement Risk & Career Intelligence Platform",
  description: "AI-powered career analysis that predicts placement outcomes, identifies skill gaps, estimates salaries, and builds personalized roadmaps using 7 intelligent AI agents.",
  keywords: ["career intelligence", "placement risk", "AI career analysis", "skill gap", "salary estimation", "job market", "career roadmap"],
  authors: [{ name: "AI Career Intelligence" }],
  icons: {
    icon: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "AI Placement Risk & Career Intelligence Platform",
    description: "Transform confusion into clarity — AI-driven career analysis that predicts your placement outcome",
    type: "website",
    url: "https://career-intelligence.com",
    siteName: "AI Career Intelligence",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Placement Risk & Career Intelligence Platform",
    description: "Transform confusion into clarity — AI-driven career analysis that predicts your placement outcome",
    creator: "@CareerIntell",
  },
  metadataBase: new URL("https://career-intelligence.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster />
          <FloatingChatWrapper />
        </AuthProvider>
      </body>
    </html>
  );
}
