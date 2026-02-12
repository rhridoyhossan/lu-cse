import CurriculumList from "@/components/CurriculumList";
import curriculumData from "@/data/curriculum.json";

export const metadata = {
  title: "Curriculum | Campus_OS",
};

export default function CurriculumPage() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <section className="py-20 px-6 text-center bg-slate-900/20 border-b border-slate-900 selection:bg-cyan-500/30">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tighter animate-fade">
          Academic <span className="text-cyan-500">Path</span>
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto animate-fade delay-200">
          Interactive syllabus. Click on any module to expand requirements and
          resources.
        </p>
      </section>

      {/* List */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 selection:bg-cyan-500/30">
        <CurriculumList data={curriculumData} />
      </main>
    </div>
  );
}