"use client";

import Link from "next/link";
import GridBackground from "@/components/GridBackground";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center font-mono text-center overflow-hidden relative">
      <GridBackground />

      <div className="relative z-10">
        <h1
          className="text-9xl font-black text-white glitch tracking-tighter mb-4"
          data-text="404"
        >
          404
        </h1>

        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-1 rounded inline-block mb-6 animate-pulse">
          ⚠ CRITICAL_ERROR: PAGE_NOT_FOUND
        </div>

        <p className="text-slate-400 max-w-md mx-auto mb-8">
          The requested resource has been moved, deleted, or never existed in
          this timeline.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center relative">
          <Link
            href="/"
            className="group relative px-6 py-3 font-bold text-black bg-cyan-500 hover:bg-cyan-400 transition-all rounded-lg"
          >
            RETURN_HOME()
          </Link>

          <Button
            onClick={() => window.history.back()}
            className="px-6 py-3 font-bold text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500 hover:bg-slate-900 transition-all bg-transparent h-full roudned-lg cursor-pointer"
          >
            GO_BACK()
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
