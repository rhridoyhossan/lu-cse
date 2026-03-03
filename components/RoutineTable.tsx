"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Download } from "lucide-react";
import * as htmlToImage from "html-to-image";

interface RoutineTableProps {
  routineData: any;
  batch: string;
  section: string;
}

export default function RoutineTable({
  routineData,
  batch,
  section,
}: RoutineTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".routine-element",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    },
    { scope: containerRef },
  );

  const exportAsImage = async () => {
    if (!tableRef.current) return;

    tableRef.current.style.borderRadius = "0px";
    tableRef.current.style.border = "none";

    try {
      const dataUrl = await htmlToImage.toPng(tableRef.current, {
        pixelRatio: 2,
        backgroundColor: "#020617",
      });

      const link = document.createElement("a");
      link.download = `Class_Routine_B${batch}_S${section}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Image generation failed:", error);
    } finally {
      tableRef.current.style.borderRadius = "0.75rem";
      tableRef.current.style.border = "";
    }
  };

  const renderSubjectCell = (subject: string) => {
    if (!subject || subject === "-" || subject === "Free Slot") {
      return <span className="text-slate-700 font-medium">-</span>;
    }
    if (subject === "Break") {
      return (
        <div className="w-full h-full min-h-20 flex items-center justify-center bg-slate-900/40">
          <span className="text-amber-500/80 text-[16px] tracking-[0.15em] uppercase font-semibold">
            Break
          </span>
        </div>
      );
    }

    const parts = subject.trim().split(/\s+/);
    return (
      <div className="flex flex-col items-center justify-center py-2 px-1 gap-1.5 h-full min-h-22">
        <span className="text-cyan-400 font-semibold text-lg tracking-tight whitespace-nowrap">
          {parts[0]}
        </span>
        <div className="flex flex-col items-center gap-1">
          {parts[1] && (
            <span className="text-slate-400 text-[13px] font-medium whitespace-nowrap">
              {parts[1]}
            </span>
          )}
          {parts[2] && (
            <span className="text-slate-500 text-[12px] px-1.5 py-0.5 bg-slate-900 rounded-md border border-slate-800/60 whitespace-nowrap">
              {parts[2]}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="w-full flex flex-col items-end gap-4 routine-element opacity-0">
        <button
          onClick={exportAsImage}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all group shrink-0"
        >
          <Download
            size={16}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
          Download Routine
        </button>

        {/* Mobile Responsive Wrapper */}
        <div className="w-full overflow-x-auto pb-4 -mx-4 sm:mx-0 px-4 sm:px-0 scroll-smooth">
          <div
            ref={tableRef}
            className="w-max min-w-full inline-block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl p-4 sm:p-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-200">
                Batch {batch} • Section {section}
              </h2>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-900 text-slate-400 font-medium border-b border-slate-800">
                  <tr>
                    {/* Sticky left column for mobile scrolling */}
                    <th className="px-4 py-4 text-center w-24 border-r border-slate-800 bg-slate-900/95 uppercase tracking-wider text-xs sticky left-0 z-10 backdrop-blur-sm">
                      Day
                    </th>
                    {routineData.timelines.map((time: string, i: number) => (
                      <th
                        key={i}
                        className="px-2 py-4 text-center border-r border-slate-800 last:border-r-0 text-xs tracking-wide whitespace-nowrap"
                      >
                        {time}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.entries(routineData.routine).map(
                    ([day, slots]: [string, any]) => (
                      <tr
                        key={day}
                        className="hover:bg-slate-900/30 transition-colors group"
                      >
                        <td className="px-4 py-0 border-r border-slate-800 text-slate-300 font-semibold text-center align-middle bg-slate-900/95 group-hover:bg-slate-800/95 transition-colors sticky left-0 z-10 backdrop-blur-sm shadow-[2px_0_10px_rgba(0,0,0,0.2)]">
                          {day}
                        </td>
                        {slots.map((slot: any, i: number) => (
                          <td
                            key={i}
                            className="p-0 border-r border-slate-800 last:border-r-0 text-center relative align-middle min-w-30"
                          >
                            {renderSubjectCell(slot.subject)}
                          </td>
                        ))}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
