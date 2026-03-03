"use client";

import { useState, useEffect } from "react";
import RoutineTable from "./RoutineTable";
import { Loader2 } from "lucide-react";

interface BatchData {
  batch: string;
  sections: string[];
}

export default function RoutineManager() {
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [routineData, setRoutineData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/routine", {
      headers: {
        "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setBatches(data.classes);
      });
  }, []);

  useEffect(() => {
    if (!selectedBatch || !selectedSection) {
      setRoutineData(null);
      return;
    }

    setLoading(true);
    fetch("/api/routine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
      },
      body: JSON.stringify({ batch: selectedBatch, section: selectedSection }),
    })
      .then((res) => res.json())
      .then((data) => {
        setRoutineData(data);
        setLoading(false);
      });
  }, [selectedBatch, selectedSection]);

  const currentSections =
    batches.find((b) => b.batch === selectedBatch)?.sections || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-3">
        <select
          className="bg-slate-900 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all cursor-pointer min-w-35 animate-fade"
          value={selectedBatch}
          onChange={(e) => {
            setSelectedBatch(e.target.value);
            setSelectedSection("");
          }}
        >
          <option value="" className="bg-slate-950">
            Select Batch
          </option>
          {batches.map((b) => (
            <option key={b.batch} value={b.batch} className="bg-slate-950">
              Batch {b.batch}
            </option>
          ))}
        </select>

        <select
          className="bg-slate-900 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all cursor-pointer min-w-35 disabled:opacity-60 animate-fade delay-100"
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          disabled={!selectedBatch}
        >
          <option value="" className="bg-slate-950">
            Section
          </option>
          {currentSections.map((sec) => (
            <option key={sec} value={sec} className="bg-slate-950">
              Section {sec}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-500 gap-4">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm text-slate-400 animate-pulse">
            Extracting Routine...
          </span>
        </div>
      )}

      {routineData && !loading && (
        <RoutineTable
          routineData={routineData}
          batch={selectedBatch}
          section={selectedSection}
        />
      )}
    </div>
  );
}
