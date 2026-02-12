"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, BookOpen, AlertCircle, Cpu } from "lucide-react";

export default function CourseCard({ course }: { course: any }) {
  const [isOpen, setIsOpen] = useState(false);

  const isLab = course.title.toLowerCase().includes("sessional");

  const borderColor = isLab
    ? "group-hover:border-purple-500/50"
    : "group-hover:border-cyan-500/50";
  const iconColor = isLab ? "text-purple-400" : "text-cyan-400";
  const badgeStyle = isLab
    ? "bg-purple-950/30 text-purple-400 border-purple-800"
    : "bg-cyan-950/30 text-cyan-400 border-cyan-800";

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      className={`course-card opacity-0 relative h-fit group bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer ${borderColor} ${isOpen ? "ring-1 ring-slate-700 bg-slate-900" : "hover:-translate-y-1 hover:shadow-xl"}`}
    >
      <div className="p-5 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <Badge
            variant="outline"
            className={`font-mono text-xs tracking-wider ${badgeStyle}`}
          >
            {course.course_code}
          </Badge>
          <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
            <span>{course.credits} CR</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : ""}`}
            />
          </div>
        </div>

        <div>
          <h3
            className={`font-bold text-lg leading-tight ${isOpen ? "text-white" : "text-slate-300 group-hover:text-white"}`}
          >
            {course.title}
          </h3>
          {!isOpen && course.prerequisites?.length > 0 && (
            <div className="mt-2 flex gap-1">
              {course.prerequisites.map((pre: string) => (
                <span
                  key={pre}
                  className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                >
                  Req: {pre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 border-t border-slate-800/50 mt-2">
            <div className="mt-4 text-sm text-slate-400 leading-relaxed">
              {course.description}
            </div>

            <div className="mt-6 space-y-3">
              {course.prerequisites?.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertCircle
                    size={14}
                    className="text-red-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1">
                      Prerequisites:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {course.prerequisites.map((pre: string) => (
                        <span
                          key={pre}
                          className="text-xs font-mono text-red-300 bg-red-950/20 px-2 py-1 rounded border border-red-900/30"
                        >
                          {pre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {course.resources?.length > 0 && (
                <div className="flex items-start gap-2">
                  <BookOpen
                    size={14}
                    className={`${iconColor} mt-0.5 shrink-0`}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-300 block mb-1">
                      Resources:
                    </span>
                    <ol className="space-y-1 list-decimal list-inside">
                      {course.resources.map((res: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-400 hover:text-white transition-colors"
                        >
                          {res}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}

              {isLab && (
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
                  <Cpu size={14} className="text-purple-400" />
                  <span className="text-xs text-purple-300 font-mono">
                    LABORATORY SESSION REQUIRED
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
