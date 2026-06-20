"use client";

import { useEffect, useState } from "react";
import { Terminal, Clock } from "lucide-react";
import Typewriter from "typewriter-effect";
import GridBackground from "./GridBackground";

export default function MaintenanceView() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeStr = time
    ? time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      })
    : "00:00:00";

  const dateStr = time
    ? time.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "--- --, ----";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 font-mono flex flex-col justify-between overflow-hidden">
      <GridBackground />

      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/5 to-transparent h-1/2 w-full animate-pulse pointer-events-none z-10" />

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 border-b border-slate-900 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-red-950/20 border border-red-500/30 text-red-400 font-bold uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Offline
          </div>
          <span className="text-slate-700">|</span>
          <span>SYS_MODE: MAINTENANCE</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            <span className="tabular-nums">{timeStr}</span>
          </div>
          <span className="text-slate-700">|</span>
          <span>{dateStr}</span>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-6 flex flex-col justify-center py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-wider uppercase glitch" data-text="SYSTEM_OFFLINE">
              SYSTEM_OFFLINE
            </h1>
            <h2 className="text-cyan-400 font-semibold tracking-widest text-sm uppercase">
              // Campus_OS Undergoing Upgrades
            </h2>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 min-h-35 shadow-[0_0_30px_rgba(6,182,212,0.02)] relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-2 right-2 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800" />
            </div>

            <div className="text-cyan-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Terminal size={14} />
              Diagnostics Terminal
            </div>

            <div className="text-slate-300 text-sm leading-relaxed sm:text-base h-20">
              <Typewriter
                options={{
                  strings: [
                    "Initializing scheduled maintenance protocols...",
                    "Optimizing database query pipelines...",
                    "Recompiling Campus_OS core modules...",
                    "Syncing routines and resource maps...",
                    "Preparing upgrades for next semester modules...",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 40,
                  deleteSpeed: 20,
                  cursor: "▋",
                }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              The portal is temporarily offline for a limited time and will be coming back online soon.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
