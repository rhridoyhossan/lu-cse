import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/Navbar";
import "./globals.css";
import SmoothScrollProvider from "@/lib/SmoothScrollProvider";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LU CSE",
  description:
    "Where Dedication Compiles and Spirit Executes. Leading University CSE",
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
