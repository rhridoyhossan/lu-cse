import GridBackground from "@/components/GridBackground";
import RoutineManager from "@/components/RoutineManager";
import { Calendar } from "lucide-react";

export const metadata = {
  title: "Class Routine | LU CSE Campus_OS",
  description: "View the latest class routine and timetable for Leading University CSE students in Sylhet. Stay on schedule with Campus_OS.",
};

export default function RoutinePage() {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 relative flex flex-col">
      <GridBackground />

      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-3 animate-fade">
          <Calendar className="text-cyan-500" size={28} />
          Class Routine
        </h1>
        <p className="text-slate-400 text-sm md:text-base animate-fade delay-200">
          Select your batch and section to view the weekly schedule.
        </p>
      </div>

      <RoutineManager />
    </main>
  );
}
