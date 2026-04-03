"use client"

import { useEffect, useState, use } from "react";
import { courseData, DEFAULT_EXAM_DETAILS } from "@/data/course";
import Link from "next/link";
import {
  FileText,
  FolderOpen,
  Clock,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { notFound } from "next/navigation";

interface FileData {
  id: string;
  name: string;
  type: string;
  viewLink: string;
}

interface Subfolder {
  name: string;
  files: FileData[];
}

interface ApiResponse {
  success: boolean;
  course: string;
  subfolders: Subfolder[];
}

export default function CourseDetailsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const resolvedParams = use(params);
  const courseCode = resolvedParams.code.toUpperCase();

  const course = courseData.find((c) => c.course_code === courseCode);
  if (!course || course.title.toLowerCase().includes("sessional")) notFound();

  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!course || course.title.toLowerCase().includes("sessional")) {
      setIsLoading(false);
      return;
    }

    const fetchResources = async () => {
      try {
        const res = await fetch(`/api/course?code=${courseCode}`, {
          headers: {
            "x-internal-token":
              process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || "",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setApiData(data);
      } catch (error) {
        console.error("API Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [courseCode, course]);

  const subfolders = apiData?.subfolders || [];

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto px-6 pt-10 pb-16 font-mono min-h-[calc(100vh-5rem)] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Terminal size={32} />
          </div>
          <p className="text-cyan-400 tracking-widest uppercase text-sm font-bold">
            Fetching Data Logs...
          </p>
          <div className="flex gap-1 mt-2">
            <div
              className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>
        </div>
      </div>
    );
  }

  const resolvedExamDetails = {
    ...course?.exam_details,
    mid: course?.exam_details?.mid
      ? [...DEFAULT_EXAM_DETAILS.mid, ...course.exam_details.mid]
      : DEFAULT_EXAM_DETAILS.mid,

    final: course?.exam_details?.final
      ? [...DEFAULT_EXAM_DETAILS.final, ...course.exam_details.final]
      : DEFAULT_EXAM_DETAILS.final,
  };

  const examCard = [
    {
      title: "MID TERM",
      data: resolvedExamDetails?.mid,
      color: "border-l-cyan-500",
    },
    {
      title: "FINAL EXAM",
      data: resolvedExamDetails?.final,
      color: "border-l-purple-500",
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 pt-10 pb-16 font-mono min-h-[calc(100vh-5rem)] animate-fade">
      <div className="mb-10 flex flex-col items-start gap-4 animate-fade">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest uppercase">
          <Terminal size={12} />
          System Target: {course.course_code}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          {course.title}
        </h1>
      </div>

      {course.exam_details && (
        <div className="mb-12 bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-bold text-slate-300 mb-6 flex items-center gap-2">
            <Clock size={18} className="text-slate-500" />
            <span>Question Pattern</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examCard.map((exam, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg bg-slate-950 border border-slate-800 border-l-2 ${exam.color} animate-fade delay-200`}
              >
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">
                  {exam.title}
                </div>
                <ul className="text-sm text-slate-200 flex flex-col gap-2">
                  {exam?.data?.map((detail, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-slate-600">›</span>
                      {detail.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-4 flex items-center gap-2">
          <FolderOpen size={20} className="text-cyan-400" />
          Compiled Resources
        </h2>

        {subfolders.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
            Directory is empty. Working hard to add these records soon.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {subfolders
              .slice()
              .reverse()
              .map((folder) => (
                <div key={folder.name} className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    {folder.name} ARCHIVE
                  </h3>

                  {folder.files.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {folder.files.map((file) => (
                        <Link
                          key={file.id}
                          href={file.viewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center justify-between p-4 rounded-lg bg-slate-900/40 border border-slate-800 hover:bg-slate-900 hover:border-cyan-500/50 transition-all"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <FileText
                              size={16}
                              className="text-slate-500 shrink-0 group-hover:text-cyan-400 transition-colors"
                            />
                            <span className="text-sm text-slate-300 truncate group-hover:text-white transition-colors">
                              {file.name}
                            </span>
                          </div>
                          <ExternalLink
                            size={14}
                            className="text-slate-600 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 transition-all shrink-0 ml-2"
                          />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-slate-950 border border-dashed border-slate-800 rounded-lg text-slate-500 text-sm">
                      No files compiled yet. Working hard to add this!
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
