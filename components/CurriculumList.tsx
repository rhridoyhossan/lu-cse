"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import CourseCard from "./CourseCard";

gsap.registerPlugin(ScrollTrigger);

export default function CurriculumList({ data }: { data: any[] }) {
  const groupedData = data.reduce(
    (acc, course) => {
      if (!acc[course.semester]) acc[course.semester] = [];
      acc[course.semester].push(course);
      return acc;
    },
    {} as Record<string, any[]>,
  );

  const semesterOrder = [
    "Y1 T1",
    "Y1 T2",
    "Y1 T3",
    "Y2 T1",
    "Y2 T2",
    "Y2 T3",
    "Y3 T1",
    "Y3 T2",
    "Y3 T3",
    "Y4 T1",
    "Y4 T2",
    "Y4 T3",
    "Elective",
  ];

  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const sections = gsap.utils.toArray<HTMLElement>(".semester-section");

      sections.forEach((section) => {
        const title = section.querySelector(".semester-title");
        const cards = section.querySelectorAll(".course-card");

        gsap.fromTo(
          [title, cards],
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 90%",
              end: "bottom 10%",
              // play: Enter, reverse: Leave, restart: EnterBack, reverse: LeaveBack
              toggleActions: "play reverse restart reverse",
            },
          },
        );
      });
    },
    { scope: wrapperRef },
  );

  return (
    <div ref={wrapperRef} className="space-y-20 pb-20">
      {semesterOrder.map((sem) => {
        const courses = groupedData[sem];
        if (!courses) return null;

        return (
          <section key={sem} className="semester-section space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="semester-title text-2xl font-bold text-white tracking-tight font-mono">
                {sem.startsWith("Y") ? (
                  <>
                    Year {sem[1]}
                    <span className="text-slate-700 mx-3">-</span>
                    Term {sem.slice(-1)}
                  </>
                ) : (
                  sem
                )}
              </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
              {courses.map((c: any, i:number) => (
                <CourseCard key={i} course={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
