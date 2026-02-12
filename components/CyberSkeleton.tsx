import { Skeleton } from "@/components/ui/skeleton"

export default function CyberSkeleton() {
  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Fake Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <Skeleton className="h-8 w-48 bg-slate-800/50" /> {/* Title */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-slate-800/50" />
          <Skeleton className="h-8 w-20 bg-slate-800/50" />
        </div>
      </div>

      {/* Fake Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border border-slate-800 bg-slate-900/50 rounded-xl p-4 space-y-4">
            {/* Image Placeholder */}
            <Skeleton className="h-32 w-full bg-slate-800/30 rounded-lg" />
            
            {/* Text Lines */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 bg-slate-800/50" />
              <Skeleton className="h-4 w-1/2 bg-slate-800/50" />
            </div>
            
            {/* Fake Button */}
            <Skeleton className="h-8 w-full bg-slate-800/20 mt-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}