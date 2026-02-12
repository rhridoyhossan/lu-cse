import { Terminal } from "lucide-react";

export const metadata = {
  title: "Achievements | Campus_OS",
};

export default function AchievementsPage() {
  return (
    <main className="flex-1 w-full overflow-hidden flex flex-col items-center justify-center relative z-10 p-6 selection:bg-yellow-500/30">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

        {/* --- THE SCANNER ANIMATION --- */}
        <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center mb-12">
          {/* Outer Rings (Static) */}
          <div className="absolute inset-0 border border-slate-800 rounded-full opacity-50" />
          <div className="absolute inset-8 border border-slate-800/60 rounded-full opacity-50" />
          <div className="absolute inset-24 border border-dashed border-slate-700/50 rounded-full opacity-50" />

          {/* The Rotating Radar Sweep */}
          <div className="absolute inset-0 rounded-full animate-[spin_4s_linear_infinite] overflow-hidden">
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-linear-to-br from-transparent via-transparent to-yellow-500/20 origin-bottom-right rounded-tl-full" />
          </div>

          {/* The "Scanning" Laser Line */}
          <div className="absolute w-full h-0.5 bg-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-[scan_3s_ease-in-out_infinite]" />

          {/* Center Core */}
          <div className="relative z-10 bg-slate-950 border border-slate-800 p-6 rounded-full shadow-2xl shadow-yellow-500/10">
            <Terminal size={40} className="text-yellow-500 animate-pulse" />
          </div>

          {/* Random "Blips"  */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-0 [animation-delay:1s]" />
          <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping opacity-0 [animation-delay:2.5s]" />
        </div>

        {/* --- TEXT CONTENT --- */}
        <div className="text-center space-y-4 max-w-lg z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-950/20 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
            System_Status: Scanning
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
            NO_RECORDS_<span className="text-slate-600">FOUND</span>
          </h1>

          <p className="text-slate-500 text-sm md:text-base leading-relaxed">
            The Hall of Fame is currently empty.
            <br />
            Waiting for <span className="text-yellow-500">Batch 68</span> to
            make history.
          </p>
        </div>
      </main>
  );
}