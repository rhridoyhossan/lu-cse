"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Download, Clock, MapPin, Users } from "lucide-react";
import * as htmlToImage from "html-to-image";

interface TeacherRoutineTableProps {
  routineData: {
    teacher: string;
    routine: Record<string, any[]>;
    allTimes: string[];
  };
  teacher: string;
}

export default function TeacherRoutineTable({
  routineData,
  teacher,
}: TeacherRoutineTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const allTimes = routineData.allTimes;

  useGSAP(
    () => {
      gsap.fromTo(
        ".routine-element",
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.05 },
      );
    },
    { scope: containerRef },
  );

  const exportAsImage = async () => {
    if (!tableRef.current) return;
    const originalBorderRadius = tableRef.current.style.borderRadius;

    tableRef.current.style.borderRadius = "0px";
    try {
      const dataUrl = await htmlToImage.toPng(tableRef.current, {
        pixelRatio: 2,
        backgroundColor: "#020617",
      });
      const link = document.createElement("a");
      link.download = `Teacher_Routine_${teacher.replace(/\s+/g, "_")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      tableRef.current.style.borderRadius = originalBorderRadius;
    }
  };

  const renderCell = (day: string, time: string) => {
    const classInfo = routineData.routine[day]?.find(
      (cls) => cls.time === time,
    );

    if (!classInfo) {
      return <span className="text-slate-800">—</span>;
    }

    if (classInfo.subject === "Break") {
      return (
        <div className="w-full h-full min-h-25 flex items-center justify-center bg-slate-900/40">
          <span className="text-amber-500/80 text-[14px] tracking-[0.15em] uppercase font-semibold">
            Break
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-3 px-2 gap-1 min-h-25">
        <span className="text-cyan-400 font-bold text-sm leading-tight text-center">
          {classInfo.subject}
        </span>
        <div className="flex flex-col items-center gap-1 mt-1">
          <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            <Users size={10} className="text-cyan-500/50" />
            <span>
              B{classInfo.batch} • {classInfo.section}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <MapPin size={10} />
            <span>{classInfo.room}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full">
      <div className="w-full flex flex-col items-end gap-4 routine-element opacity-0">
        <button
          onClick={exportAsImage}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-sm font-medium text-cyan-400 hover:bg-cyan-500/20 transition-all group"
        >
          <Download
            size={16}
            className="group-hover:-translate-y-0.5 transition-transform"
          />
          Download Table
        </button>

        <div className="w-full overflow-x-auto pb-4 scroll-smooth">
          <div
            ref={tableRef}
            className="w-max min-w-full inline-block bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-6"
          >
            {/* Header */}
            <div className="mb-6 border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                <span className="w-2 h-6 bg-cyan-500 rounded-full" />
                Teacher Schedule:{" "}
                <span className="text-cyan-400">{teacher}</span>
              </h2>
            </div>

            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-slate-900/50 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 text-center w-28 border-r border-slate-800 bg-slate-900 font-bold uppercase tracking-widest text-[10px] sticky left-0 z-10">
                      Day
                    </th>
                    {allTimes.map((time) => (
                      <th
                        key={time}
                        className="px-4 py-4 text-center border-r border-slate-800 last:border-r-0 min-w-[140px]"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-cyan-500/80">
                          <Clock size={12} />
                          <span className="text-xs font-semibold">{time}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.keys(routineData.routine).map((day) => (
                    <tr
                      key={day}
                      className="hover:bg-slate-900/20 transition-colors group"
                    >
                      <td className="px-6 py-4 border-r border-slate-800 text-slate-200 font-bold text-center bg-slate-900/80 group-hover:bg-slate-800 transition-colors sticky left-0 z-10 shadow-[4px_0_12px_rgba(0,0,0,0.3)]">
                        {day}
                      </td>
                      {allTimes.map((time) => (
                        <td
                          key={time}
                          className="p-0 border-r border-slate-800 last:border-r-0 text-center align-middle"
                        >
                          {renderCell(day, time)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
