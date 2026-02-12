"use client";

import {
  FileText,
  Video,
  Book,
  Globe,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ResourceCard({ data }: { data: any[] }) {
  const [title, format, tagsRaw, link, author] = data;
  const tags = tagsRaw ? tagsRaw.split(",").map((t: string) => t.trim()) : [];

  // Icon Logic
  const getIcon = (fmt: string) => {
    const f = fmt?.toLowerCase() || "";
    if (f.includes("pdf")) return <FileText className="text-red-400" />;
    if (f.includes("video")) return <Video className="text-purple-400" />;
    if (f.includes("book")) return <Book className="text-amber-400" />;
    if (f.includes("tool")) return <Terminal className="text-green-400" />;
    return <Globe className="text-cyan-400" />;
  };

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="resource-card opacity-0 group relative bg-slate-900/50 border border-slate-800 rounded-xl p-5 hover:bg-slate-900 hover:border-cyan-500/30 transition-all duration-300 flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
          {getIcon(format)}
        </div>
        <Badge
          variant="outline"
          className="bg-slate-950 border-slate-800 text-slate-500 text-[10px] uppercase tracking-wider"
        >
          {format}
        </Badge>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-200 group-hover:text-cyan-400 transition-colors line-clamp-2">
          {title}
        </h3>

        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-[10px] text-slate-400 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50 group-hover:border-slate-600 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-500 font-mono">
        <span>By {author}</span>
        <ExternalLink
          size={14}
          className="group-hover:text-cyan-400 transition-colors"
        />
      </div>
    </a>
  );
}
