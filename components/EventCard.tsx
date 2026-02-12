"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";

const EventCard = ({ data }: any) => {
  const eventRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!eventRef.current) return;

      gsap.fromTo(
        ".event-element",
        { y: 50 },
        { y: 0, opacity: 1, stagger: 0.2, delay: 0.2, ease: "power3.out" },
      );
    },
    { scope: eventRef },
  );
  return (
    <div
      ref={eventRef}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {data.map((row: any, i: number) => (
        <div
          key={i}
          className="event-element opacity-0 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] transition-all duration-500 group flex flex-col"
        >
          {/* Image Area */}
          <div className="h-48 overflow-hidden relative bg-slate-800 shrink-0">
            <div className="absolute inset-0 bg-purple-900/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
            
            {row[5] ? (
              <img
                src={row[5]}
                alt={row[0]}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700">
                <span className="text-slate-600 font-mono font-bold tracking-widest text-lg">
                  EVENT
                </span>
              </div>
            )}

            <div className="absolute top-3 right-3 z-20 bg-black/80 backdrop-blur px-2 py-1 rounded border border-white/10 text-xs font-bold text-purple-400">
              {row[2]}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col flex-grow">
            {/* Metadata Section */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span className="flex items-center gap-1">📅 {row[3]}</span>
                <span className="flex items-center gap-1 truncate max-w-[50%] justify-end">📍 {row[7]}</span>
              </div>
              
              {/* Added Deadline here with a distinct color */}
              <div className="text-xs text-purple-400 font-medium flex items-center gap-1">
                ⏳ Deadline: {row[4]}
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
              {row[0]}
            </h3>
            
            <p className="text-slate-400 text-sm line-clamp-3 mb-6 flex-grow">{row[1]}</p>

            <div className="mt-auto">
              <a
                href={row[6]}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-center bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-600/50 py-3 rounded font-bold transition-all"
              >
                REGISTER_NOW()
              </a>

              {/* Added By Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-600 flex justify-between items-center">
                <span>Added by</span>
                <span className="text-slate-500 font-medium bg-slate-800/50 px-2 py-0.5 rounded">
                  {row[8]}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default EventCard;
