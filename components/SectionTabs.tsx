"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import TechCard from "@/components/TechCard";

export default function SectionTabs({ notices }: { notices: any[] }) {
  const noticesRef = useRef<HTMLDivElement>(null);

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
    { scope: noticesRef },
  );

  return (
    <div ref={noticesRef} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notices.map((row: any[], i: number) => (
          <TechCard
            key={i}
            data={{
              title: row[0],
              category: "GENERAL",
              description: row[1],
              imageUrl: row[2],
              link: row[3],
              author: row[4],
              class: "notice-element opacity-0",
            }}
          />
        ))}
      </div>

      {notices.length === 0 && (
        <div className="p-10 text-center border border-dashed border-slate-800 rounded text-slate-600">
          Directory is empty.
        </div>
      )}
    </div>
  );
}
