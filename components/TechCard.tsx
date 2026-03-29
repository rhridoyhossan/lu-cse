"use client";

import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Terminal, ArrowUpRight, Eye, User, Loader2 } from "lucide-react";

interface TechCardProps {
  data: {
    title: string;
    category?: string;
    link?: string;
    imageUrl?: string;
    author?: string;
    class?: string;
  };
}

export default function TechCard({ data }: TechCardProps) {
  const hasImage = Boolean(data.imageUrl);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  return (
    <>
      {selectedImage && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            </div>
          )}
          <img
            src={selectedImage}
            alt="Full size"
            onLoad={() => setIsImageLoading(false)}
            className={`max-h-[90vh] max-w-[95vw] object-contain rounded-md shadow-2xl transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>
      )}

      <div
        className={`${data.class} group relative h-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all duration-500 shadow-lg hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]`}
      >
        {/* Header */}
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between backdrop-blur-md z-20 cursor-default">
          <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded border border-slate-800/50">
            <Terminal size={10} className="text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 leading-none mt-0.5">
              system_notice.log
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 relative flex flex-col">
          {/* Background Effects */}
          <>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none opacity-50" />
            <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-slate-800 group-hover:border-cyan-500/50 transition-colors opacity-50 group-hover:opacity-100" />
            <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-slate-800 group-hover:border-cyan-500/50 transition-colors opacity-50 group-hover:opacity-100" />
          </>

          <div className="relative z-10 flex-1">
            <div className="flex justify-between items-start mb-4">
              <Badge
                variant="outline"
                className="font-mono text-[10px] text-cyan-400 border-cyan-500/20 bg-cyan-950/10 tracking-wider"
              >
                {data.category || "SYSTEM"}
              </Badge>
            </div>

            {/* Title */}
            {data.link ? (
              <a
                href={data.link}
                target="_blank"
                rel="noreferrer"
                className="block text-lg font-bold text-slate-200 hover:text-green-300 transition-colors font-mono tracking-tight mb-3 cursor-pointer"
              >
                {data.title}
              </a>
            ) : (
              <h3
                className={`text-lg font-bold text-slate-200 hover:text-green-400 transition-colors font-mono tracking-tight mb-3 ${
                  data.imageUrl ? "cursor-pointer" : "cursor-default"
                }`}
                onClick={() => data.imageUrl && setSelectedImage(data.imageUrl)}
              >
                {data.title}
              </h3>
            )}
          </div>

          {/* Footer */}
          <div className=" pt-4 border-t border-slate-800/50 flex justify-between items-center relative z-10 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">
                  Live
                </span>
              </div>

              {hasImage && (
                <button
                  className="flex items-center gap-1.5 px-2 py-1 rounded-sm bg-slate-900 border border-slate-800 text-[9px] font-mono text-cyan-500 hover:bg-cyan-950/50 hover:border-cyan-500/50 transition-all group/eye cursor-pointer"
                  onClick={() =>
                    data.imageUrl && setSelectedImage(data.imageUrl)
                  }
                >
                  <Eye size={10} className="group-hover/eye:text-cyan-400" />
                  <span>ASSET</span>
                </button>
              )}

              {data.author && (
                <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px]">
                  <User size={10} className="text-slate-600" />
                  <span className="text-slate-400">
                    Added by{" "}
                    <span className="text-cyan-600/80">{data.author}</span>
                  </span>
                </div>
              )}
            </div>

            {data.link && (
              <a
                href={data.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-400 transition-all group/btn bg-slate-900 hover:bg-cyan-950/30 px-3 py-1.5 rounded-sm border border-slate-800 hover:border-cyan-500/50"
              >
                <span className="font-mono">OPEN</span>
                <ArrowUpRight
                  size={12}
                  className="text-slate-500 group-hover/btn:text-cyan-400 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-all"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
