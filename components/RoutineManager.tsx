"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import RoutineTable from "./RoutineTable";
import TeacherRoutineTable from "./TeacherRoutineTable";
import {
  Loader2,
  GraduationCap,
  UserSquare2,
  Search,
  ChevronDown,
} from "lucide-react";

interface BatchData {
  batch: string;
  sections: string[];
}

export default function RoutineManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const typeParam = searchParams.get("type");
  const activeTab = typeParam === "teacher" ? "teacher" : "student"; // Default student

  // Student State
  const [batches, setBatches] = useState<BatchData[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [studentRoutine, setStudentRoutine] = useState<any>(null);

  // Teacher State
  const [teachers, setTeachers] = useState<string[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [teacherSearch, setTeacherSearch] = useState<string>("");
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);
  const [teacherRoutine, setTeacherRoutine] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: "student" | "teacher") => {
    router.push(`${pathname}?type=${tab}`, { scroll: false });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsTeacherDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Both Api GET Requests
  useEffect(() => {
    fetch("/api/routine", {
      headers: {
        "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setBatches(data.classes);
      })
      .catch(() => console.error("Failed to fetch batches"));

    fetch("/api/teacher-routine", {
      headers: {
        "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.teachers) setTeachers(data.teachers);
      })
      .catch(() => console.error("Failed to fetch teachers list"));
  }, []);

  // Student Routine
  useEffect(() => {
    if (activeTab !== "student" || !selectedBatch || !selectedSection) {
      setStudentRoutine(null);
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
        setStudentRoutine(data);
      })
      .catch((err) => console.error("Failed to fetch student routine"))
      .finally(() => setLoading(false));
  }, [selectedBatch, selectedSection, activeTab]);

  // Teacher Routine
  useEffect(() => {
    if (activeTab !== "teacher" || !selectedTeacher) {
      setTeacherRoutine(null);
      return;
    }

    setLoading(true);

    fetch("/api/teacher-routine", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
      },
      body: JSON.stringify({ teacher: selectedTeacher }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);

        const hasClasses = Object.values(data.routine).some(
          (dayClasses: any) => dayClasses.length > 0,
        );

        if (!hasClasses) {
          setTeacherRoutine(null);
        } else {
          setTeacherRoutine(data);
        }
      })
      .catch((err) => console.error(err.message))
      .finally(() => setLoading(false));
  }, [selectedTeacher, activeTab]);

  const currentSections =
    batches.find((b) => b.batch === selectedBatch)?.sections || [];

  // Filter search input
  const filteredTeachers = teachers.filter((t) =>
    t.toLowerCase().includes(teacherSearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-900/50 border border-slate-800 rounded-lg w-max animate-fade">
        <button
          onClick={() => handleTabChange("student")}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "student"
              ? "bg-slate-800 text-cyan-400 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <GraduationCap size={18} />
          Student
        </button>
        <button
          onClick={() => handleTabChange("teacher")}
          className={`flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === "teacher"
              ? "bg-slate-800 text-cyan-400 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
          }`}
        >
          <UserSquare2 size={18} />
          Teacher
        </button>
      </div>

      <div className="animate-fade delay-100 min-h-11 relative z-20">
        {activeTab === "student" ? (
          <div className="flex flex-wrap gap-3">
            <select
              className="bg-slate-900 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all cursor-pointer min-w-35"
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
              className="bg-slate-900 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all cursor-pointer min-w-35 disabled:opacity-60"
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
        ) : (
          <div className="relative w-full sm:max-w-xs" ref={dropdownRef}>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-500" />
              </div>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-slate-500 uppercase"
                placeholder="Search Teacher..."
                value={teacherSearch}
                onChange={(e) => {
                  setTeacherSearch(e.target.value.toUpperCase());
                  setIsTeacherDropdownOpen(true);
                  if (e.target.value !== selectedTeacher) {
                    setSelectedTeacher("");
                  }
                }}
                onFocus={() => setIsTeacherDropdownOpen(true)}
              />
              <div
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                onClick={() => setIsTeacherDropdownOpen(!isTeacherDropdownOpen)}
              >
                <ChevronDown
                  size={16}
                  className={`text-slate-500 transition-transform duration-200 ${isTeacherDropdownOpen ? "rotate-180" : ""}`}
                />
              </div>
            </div>

            {/* Dropdown List */}
            {isTeacherDropdownOpen && (
              <div className="absolute w-full mt-2 bg-slate-900 border border-slate-800 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 z-50 pointer-events-auto">
                {filteredTeachers.length > 0 ? (
                  <div className="p-1 flex flex-col">
                    {filteredTeachers.map((t) => (
                      <button
                        key={t}
                        className={`text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedTeacher === t
                            ? "bg-cyan-500/10 text-cyan-400 font-medium"
                            : "text-slate-300 hover:bg-slate-800 hover:text-cyan-400"
                        }`}
                        onClick={() => {
                          setTeacherSearch(t);
                          setSelectedTeacher(t);
                          setIsTeacherDropdownOpen(false);
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500 text-center">
                    No matching teacher found
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-500 gap-4 relative z-10">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm text-slate-400 animate-pulse">
            Extracting Routine...
          </span>
        </div>
      )}

      {/* Data */}
      <div className="relative z-10">
        {!loading && activeTab === "student" && studentRoutine && (
          <RoutineTable
            routineData={studentRoutine}
            batch={selectedBatch}
            section={selectedSection}
          />
        )}

        {!loading && activeTab === "teacher" && teacherRoutine && (
          <TeacherRoutineTable
            routineData={teacherRoutine}
            teacher={teacherRoutine.teacher}
          />
        )}
      </div>
    </div>
  );
}
