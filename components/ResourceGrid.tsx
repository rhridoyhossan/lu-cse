"use client";

import { useState, useRef } from "react";
import { Search, Filter } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import ResourceCard from "@/components/ResourceCard";

gsap.registerPlugin(ScrollTrigger);

export default function ResourceGrid({ initialData }: { initialData: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");

  // Get unique formats for filter dropdown (Format is at index 1)
  const formats = ["All", ...Array.from(new Set(initialData.map((r) => r[1])))];

  const filtered = initialData.filter((item) => {
    const [title, format, tags] = item;
    const safeTitle = (title || "").toLowerCase();
    const safeTags = (tags || "").toLowerCase();
    const safeSearch = searchTerm.toLowerCase();

    const matchesSearch =
      safeTitle.includes(safeSearch) || safeTags.includes(safeSearch);
    const matchesType = filterType === "All" || format === filterType;
    return matchesSearch && matchesType;
  });

  // Animation
  const resourceRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Normall Does Row By Row or All At Once One Time Only
      ScrollTrigger.batch(".resource-card", {
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
        // re-animate
        onLeaveBack: (elements) => {
          gsap.set(elements, { opacity: 0, y: 30 });
        },
        start: "top 90%",
      });
    },
    { scope: resourceRef, dependencies: [filtered] },
  );

  return (
    <main ref={resourceRef} className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 border-b border-slate-800 pb-8">
        <div className="animate-fade">
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-cyan-500">~/</span>Library
          </h1>
          <p className="text-slate-400">
            {initialData.length} archived resources. Slides, books, and tools.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto animate-fade delay-150">
          {/* Search Input */}
          <div className="relative group flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-500 transition-colors"
              size={16}
            />
            <input
              type="text"
              placeholder="Search keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600 text-slate-200"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-4 pr-10 text-sm focus:outline-none focus:border-cyan-500/50 cursor-pointer text-slate-200"
            >
              {formats.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              size={14}
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((row, i) => (
            <ResourceCard key={i} data={row} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30 animate-fade">
          <p className="text-slate-500">
            No resources found matching "
            <span className="text-slate-300">{searchTerm}</span>"
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterType("All");
            }}
            className="mt-4 text-cyan-500 hover:text-cyan-400 text-sm hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </main>
  );
}
