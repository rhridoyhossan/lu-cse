import CyberSkeleton from "@/components/CyberSkeleton";
import Navbar from "@/components/Navbar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Show Navbar immediately so it feels stable */}
      <Navbar /> 
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-8 animate-pulse">
           <div className="w-2 h-2 bg-cyan-500 rounded-full"/>
           <span className="text-cyan-500 font-mono text-xs uppercase tracking-widest">
             Establishing Connection...
           </span>
        </div>
        
        <CyberSkeleton />
      </main>
    </div>
  );
}