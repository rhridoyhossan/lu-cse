"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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

interface RoutineSlot {
  time: string;
  subject: string;
}

interface StudentRoutineResponse {
  classes: BatchData[];
  timelines: string[];
  routines: Record<string, Record<string, RoutineSlot[]>>;
}

interface TeacherSlot {
  time: string;
  batch: string;
  section: string;
  subject: string;
  room: string;
}

interface TeacherRoutineResponse {
  teachers: string[];
  allTimes: string[];
  routines: Record<string, Record<string, TeacherSlot[]>>;
}

export default function RoutineManager() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const typeParam = searchParams.get("type");
  const activeTab = typeParam === "teacher" ? "teacher" : "student"; // Default student

  // Data State
  const [studentData, setStudentData] = useState<StudentRoutineResponse | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherRoutineResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Student Selection State
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");

  // Teacher Selection State
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [teacherSearch, setTeacherSearch] = useState<string>("");
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Derived loading state based on active tab data readiness
  const loading =
    !fetchError &&
    ((activeTab === "student" && !studentData) ||
      (activeTab === "teacher" && !teacherData));

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

  // Fetch active tab's routine on demand (lazy loading)
  useEffect(() => {
    let isMounted = true;

    if (activeTab === "student" && !studentData) {
      fetch("/api/routine")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load student routine data");
          return res.json() as Promise<StudentRoutineResponse>;
        })
        .then((sData) => {
          if (isMounted) {
            setStudentData(sData);
            setFetchError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error(err);
            setFetchError("Failed to load student routine data. Please try again later.");
          }
        });
    } else if (activeTab === "teacher" && !teacherData) {
      fetch("/api/teacher-routine")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load teacher routine data");
          return res.json() as Promise<TeacherRoutineResponse>;
        })
        .then((tData) => {
          if (isMounted) {
            setTeacherData(tData);
            setFetchError(null);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error(err);
            setFetchError("Failed to load teacher routine data. Please try again later.");
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [activeTab, studentData, teacherData]);

  const batches = studentData?.classes ?? [];
  const teachers = teacherData?.teachers ?? [];

  // Reconstruct legacy response shape for selected student routine
  const studentRoutine = useMemo(() => {
    if (!selectedBatch || !selectedSection || !studentData?.routines) return null;
    const routine = studentData.routines[`${selectedBatch}|${selectedSection}`];
    if (!routine) return null;
    return {
      batch: selectedBatch,
      section: selectedSection,
      timelines: studentData.timelines,
      routine,
    };
  }, [selectedBatch, selectedSection, studentData]);

  // Reconstruct legacy response shape for selected teacher routine
  const teacherRoutine = useMemo(() => {
    if (!selectedTeacher || !teacherData?.routines) return null;
    const routine = teacherData.routines[selectedTeacher] ?? {};
    const hasClasses = Object.values(routine).some(
      (dayClasses) => dayClasses.length > 0,
    );
    if (!hasClasses) return null;
    return {
      teacher: selectedTeacher,
      allTimes: teacherData.allTimes,
      routine,
    };
  }, [selectedTeacher, teacherData]);

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

      {fetchError && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
          {fetchError}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-cyan-500 gap-4 relative z-10">
          <Loader2 className="animate-spin" size={32} />
          <span className="text-sm text-slate-400 animate-pulse">
            Loading Routine Data...
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
