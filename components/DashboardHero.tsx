"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import Typewriter from "typewriter-effect";
import { useState, useEffect, useRef } from "react";
import {
  Cloud,
  Zap,
  Wifi,
  ArrowRight,
  Terminal,
  BookOpen,
  Map,
  Clock,
  Shield,
  Github,
} from "lucide-react";

export default function DashboardHero({
  latestNotice,
}: {
  latestNotice?: any;
}) {
  const [time, setTime] = useState<Date | null>(null);
  const [weather, setWeather] = useState<{ temp: number } | null>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!dashboardRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".head-element",
        { y: -20 },
        { y: 0, opacity: 1, stagger: 0.15, delay: 0.2 },
      ).fromTo(
        ".notice-element",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1 },
        "-=0.2",
      );
    },
    { scope: dashboardRef },
  );

  // Live Clock & Weather
  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);

    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=24.869363950773533&longitude=91.80476782354341&current_weather=true",
        );
        const data = await res.json();
        setWeather({ temp: data.current_weather.temperature });
      } catch (e) {
        console.error("Weather error");
      }
    }
    fetchWeather();

    return () => clearInterval(timer);
  }, []);

  const dateStr = time
    ? time.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "...";

  const timeStr = time
    ? time.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "00:00";

  return (
    <div
      ref={dashboardRef}
      className="relative w-full max-w-7xl mx-auto px-6 pt-10 pb-8 font-mono min-h-[calc(100vh-5rem)] flex flex-col justify-between"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 mb-8">
        <div className="flex flex-col gap-6">
          {/* System Status & Batch Identity */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="head-element opacity-0 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                System Online
              </span>
            </div>

            <div className="head-element opacity-0 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700">
              <Shield size={10} className="text-slate-400" />
              <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold">
                Leading University • CSE Batch 68
              </span>
            </div>
          </div>

          {/* TAGLINE with COLORED WORDS */}
          <h1 className="head-element opacity-0 text-3xl md:text-5xl font-bold text-white tracking-tight h-24 md:h-auto flex items-center">
            <Typewriter
              options={{
                strings: [
                  'Compiled with <span style="color: #22d3ee">Dedication</span>.',
                  'Executed with <span style="color: #c084fc">Spirit</span>.',
                ],
                autoStart: true,
                loop: true,
                delay: 50,
                deleteSpeed: 30,
                cursor: "_",
              }}
            />
          </h1>
        </div>

        <div className="flex gap-4">
          {/* Live Weather */}
          <div className="head-element opacity-0 bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-35 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <div className="text-2xl font-bold text-cyan-400 tracking-wider tabular-nums">
              {timeStr}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
              <Clock size={10} />
              {dateStr}
            </div>
          </div>

          {/* Time Widget */}
          <div className="head-element opacity-0 bg-slate-950/80 border border-slate-800 rounded-xl p-4 min-w-25 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.05)]">
            <div className="flex items-center gap-2">
              {weather ? (
                <span className="text-2xl font-bold text-white tabular-nums">
                  {weather.temp}°
                </span>
              ) : (
                <span className="text-2xl font-bold text-slate-600 animate-pulse">
                  --
                </span>
              )}
              <Cloud className="text-slate-400" size={18} />
            </div>
            <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
              LU,Sylhet
            </div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Notices Card */}
        <Link
          href="/notices"
          className="notice-element opacity-0 group md:col-span-2 relative bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Terminal size={120} />
          </div>
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              System Logs (Notices)
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Access academic schedules, exam routines, and class updates.
            </p>

            {latestNotice ? (
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs flex items-center gap-3">
                <span className="text-cyan-500 font-bold shrink-0 animate-pulse">
                  ● LATEST:
                </span>
                <span className="text-slate-300 line-clamp-1 font-mono">
                  {latestNotice[0]}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-600">
                No recent logs fetched.
              </span>
            )}
          </div>
        </Link>

        {/* Curriculum Card */}
        <Link
          href="/curriculum"
          className="notice-element opacity-0 group relative bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 hover:border-green-500/50 transition-colors"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-green-950/30 border border-green-500/30 text-green-400 flex items-center justify-center mb-4">
              <Map size={20} />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              Curriculum Map
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Navigate the 12-semester roadmap.
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800/50">
              <div className="flex justify-between items-center text-xs text-green-400 font-bold">
                <span>VIEW_PATH()</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Events Card */}
        <Link
          href="/events"
          className="notice-element opacity-0 group relative bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 hover:border-purple-500/50 transition-colors"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-purple-950/30 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-4">
              <Wifi size={20} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Event Horizon</h3>
            <p className="text-slate-500 text-sm mb-4">
              Visual gallery of campus activities.
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800/50">
              <div className="flex justify-between items-center text-xs text-purple-400 font-bold">
                <span>VIEW_EVENTS()</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </div>
        </Link>

        {/* GitHub Card */}
        <Link
          href="https://github.com/rhridoyhossan/lu-cse-68"
          target="_blank"
          className="notice-element opacity-0 group relative bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 hover:border-cyan-500/50 transition-colors"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
              <Github size={20} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">Repository</h3>
            <p className="text-slate-500 text-sm mb-4">
              Check out the project on GitHub
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800/50">
              <div className="flex justify-between items-center text-xs text-cyan-400 font-bold">
                <span>OPEN_REPO()</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </div>
        </Link>

        {/* Library Card */}
        <Link
          href="/resources"
          className="notice-element opacity-0 group relative bg-slate-900/70 border border-slate-800 rounded-2xl p-6 hover:bg-slate-900 hover:border-amber-500/50 transition-colors"
        >
          <div className="relative z-10 h-full flex flex-col">
            <div className="w-10 h-10 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>

            <h3 className="text-xl font-bold text-white mb-1">
              Resource Library
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Access PDFs, Slides, and Tools
            </p>

            <div className="mt-auto pt-4 border-t border-slate-800/50">
              <div className="flex justify-between items-center text-xs text-amber-400 font-bold">
                <span>ACCESS_DB()</span>
                <ArrowRight
                  size={14}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
