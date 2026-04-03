"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Search, ArrowRight, BookOpen, Calculator } from "lucide-react";
import { courseData } from "@/data/course";
import { examOverview } from "@/data/data";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function QuestionBankPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCourses = courseData.filter((course) => {
    const isTheory = !course.title.toLowerCase().includes("sessional");
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase());

    return isTheory && matchesSearch;
  });

  useGSAP(
    () => {
      ScrollTrigger.batch(".course-card", {
        onEnter: (elements) => {
          gsap.fromTo(
            elements,
            {
              opacity: 0,
              y: 30,
            },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              ease: "power3.out",
              overwrite: true,
            },
          );
        },
        onLeaveBack: (elements) => {
          gsap.set(elements, { opacity: 0, y: 30 });
        },
        start: "top 90%",
      });
    },
    { dependencies: [searchTerm], scope: containerRef },
  );

  useGSAP(() => {
    const cardArr = gsap.utils.toArray(".xmCard");

    gsap.fromTo(
      cardArr,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        ease: "power3.out",
      },
    );
  });

  return (
    <div
      ref={containerRef}
      className="w-full max-w-7xl mx-auto px-6 pt-10 pb-16 font-mono min-h-[calc(100vh-5rem)]"
    >
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 font-mono xmCard">
          <span className="text-green-500">root@campus</span>
          <span className="text-slate-600">:</span>
          <span className="text-cyan-500">~/question-bank</span>
        </h1>
        <p className="text-slate-500 delay-300 animate-fade">
          Access past queries, analyze patterns, and prepare for upcoming <br />
          evaluations. Select a course module below to initialize the <br />
          repository.
        </p>
      </div>

      {/* Summary Card */}
      <div className="mb-14 xmCard">
        <h2 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
          <Calculator size={18} className="text-slate-500" />
          <span>Evaluation Metrics (100 Marks)</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {examOverview.map((info) => {
            return (
              <div
                key={info.id}
                className="xmCard bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden group"
              >
                <div
                  className={`${info.accentColor} font-bold mb-2 flex justify-between items-center`}
                >
                  <span>{info.title}</span>
                  <span
                    className={`${info.badgeStyles} border px-2 py-0.5 rounded text-[10px] tracking-wider uppercase`}
                  >
                    {info.marks}
                  </span>
                </div>
                <ul className="text-sm text-slate-400 space-y-2 mt-4">
                  {info.details.map((detail, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-slate-600">›</span>
                      {detail.text}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="xmCard bg-slate-900/60 border border-slate-800 rounded-xl p-6 relative overflow-hidden group w-full">
          <div className="text-amber-400 font-bold mb-2 flex justify-between items-center">
            <span>SESSIONAL_LAB()</span>
            <span className="bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
              Teacher Dependent
            </span>
          </div>
          <ul className="text-sm text-slate-400 space-y-2 mt-4 md:flex md:gap-8 md:space-y-0">
            <li className="flex gap-2 flex-1">
              <span className="text-slate-600">›</span>
              <span>
                Evaluation criteria and marks distribution are fully dependent
                on the course instructor.
              </span>
            </li>
            <li className="flex gap-2 flex-1">
              <span className="text-slate-600">›</span>
              <span>
                Variables typically include: Lab Performance, Reports,
                Viva-voce, and Final Lab Exam.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <hr className="border-slate-800/60 my-8" />

      {/* Search */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h2 className="text-lg font-bold text-slate-300 flex items-center gap-2">
            <span>Course Database</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              {filteredCourses.length} records active
            </span>
          </h2>

          <div className="relative group w-full max-w-lg">
            <div className="absolute inset-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search
                size={18}
                className="text-slate-500 group-focus-within:text-cyan-400 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Search by name or code (e.g., CSE-1101, Calculus)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/70 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 outline-none transition-all shadow-[0_0_15px_rgba(6,182,212,0)] focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] text-sm"
            />
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <Link
                key={course.course_code}
                href={`/question-bank/${course.course_code.toLowerCase()}`}
                className="course-card flex flex-col justify-between bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-900 hover:border-cyan-500/50 transition-all duration-300 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs font-bold text-cyan-400 tracking-wider">
                      {course.course_code}
                    </div>
                    <BookOpen
                      size={16}
                      className="text-slate-600 group-hover:text-cyan-400 transition-colors"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/50 pt-3">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Access Bank
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-slate-800 rounded-xl mt-4">
            <p className="text-slate-500 text-sm">
              No systems matching "
              <span className="text-slate-300">{searchTerm}</span>" found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
