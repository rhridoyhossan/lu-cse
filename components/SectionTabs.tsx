"use client";

import { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import TechCard from "@/components/TechCard";

export default function SectionTabs({
  sections,
  general,
}: {
  sections: any;
  general: any[];
}) {
  const [activeTab, setActiveTab] = useState("General");

  const tabs = ["General", ...Object.keys(sections)];

  // Determine which data to show
  const currentData =
    activeTab === "General" ? general : sections[activeTab] || [];

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
  };

  // Animation
  const noticesRef = useRef<HTMLDivElement>(null);

  // Sidebar
  useGSAP(
    () => {
      gsap.fromTo(
        ".tab-element",
        { y: -20 },
        { y: 0, opacity: 1, stagger: 0.1, ease: "power3.out", delay: 0.1 },
      );
    },
    { scope: noticesRef },
  );

  // Notices
  useGSAP(
    () => {
      gsap.fromTo(
        ".notice-element",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          delay: 0.2,
          ease: "power3.out",
        },
      );
    },
    { scope: noticesRef, dependencies: [activeTab] },
  );

  return (
    <div ref={noticesRef} className="flex flex-col lg:flex-row gap-8">
      {/* SIDEBAR */}
      <aside className="w-full lg:w-64 shrink-0">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 sticky top-24">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">
            Directories
          </h3>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 pb-2 lg:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`tab-element opacity-0 px-4 py-3 rounded text-left text-sm font-bold border transition-all whitespace-nowrap flex items-center justify-between group ${
                  activeTab === tab
                    ? "bg-cyan-950/40 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                    : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span>{tab === "General" ? "📢 General" : `./${tab}`}</span>
                {activeTab === tab && (
                  <span className="text-cyan-500 animate-pulse">●</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="flex-1 min-h-150">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 animate-fade">
            <span className="text-green-500">root@campus:</span>
            <span className="text-slate-400">~/notices/</span>
            <span className="text-cyan-400">{activeTab}</span>
          </h2>
          <span className="hidden md:inline text-xs text-slate-500 font-mono bg-slate-900 px-2 py-1 rounded border border-slate-800 animate-fade delay-200">
            {currentData.length} items
          </span>
        </div>

        {/* CONDITIONAL LAYOUT: Grid for General, List for Sections */}

        {activeTab === "General" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentData.map((row: any[], i: number) => (
              <TechCard
                key={i}
                data={{
                  title: row[0],
                  category: "GENERAL",
                  imageUrl: row[2],
                  description: row[3],
                  link: row[4],
                  author: row[5],
                  class: "notice-element opacity-0",
                }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {currentData.map((row: any[], i: number) => (
              <div
                key={i}
                className="notice-element opacity-0 p-5 bg-slate-900/40 border border-slate-800 rounded-lg hover:border-slate-600 transition group flex flex-col md:flex-row gap-4"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded flex items-center justify-center shrink-0 text-xl border ${
                    row[1] === "Exam"
                      ? "bg-red-950/20 border-red-900/50 text-red-500"
                      : "bg-blue-950/20 border-blue-900/50 text-blue-500"
                  }`}
                >
                  {row[1] === "Exam" ? "⚠️" : "📝"}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">
                      {row[0]}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono whitespace-nowrap ml-4">
                      {row[2]}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {row[3]}
                  </p>
                  <div className="mt-3 flex justify-between items-center gap-4 text-xs">
                    {row[4] ? (
                      <a
                        href={row[4]}
                        target="_blank"
                        className="text-cyan-500 hover:text-cyan-300 hover:underline"
                      >
                        View Document -&gt;
                      </a>
                    ) : <div />}
                    <span className="text-slate-600">
                      Added by {row[5] || "Admin"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {currentData.length === 0 && (
          <div className="animate-fade p-10 text-center border border-dashed border-slate-800 rounded text-slate-600">
            Directory is empty.
          </div>
        )}
      </div>
    </div>
  );
}
