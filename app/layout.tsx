import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import "./globals.css";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LU CSE | Campus_OS — Leading University CSE Portal",
  description:
    "Where Dedication Compiles and Spirit Executes. Leading University CSE",
  keywords: [
    "LU CSE",
    "Leading University",
    "Campus_OS",
    "Batch 68",
    "Sylhet",
    "university portal",
    "CSE",
  ],
  openGraph: {
    siteName: "LU CSE | Campus_OS",
    url: new URL(process.env.PRODUCTION_URL!),
  },
  metadataBase: new URL(process.env.PRODUCTION_URL!),
  robots: {
    index: true,
    follow: true,
    nosnippet: true,
  },
  verification: {
    google: "3lTv94Y_Zl_MCTL1NvWC5IGbSQDasLnMKhQGeUBaHKw",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${mono.className} min-h-screen bg-slate-950 text-slate-200 antialiased flex flex-col`}
      >
        <Navbar />
        <div className="flex-1 flex flex-col">
          <SmoothScrollProvider>{children}</SmoothScrollProvider>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
