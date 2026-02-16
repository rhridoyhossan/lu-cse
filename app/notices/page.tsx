import { getBatchData } from "@/lib/googleSheets";
import SectionTabs from "@/components/SectionTabs";

export const metadata = {
  title: "Notices | Campus_OS",
};

export default async function NoticesPage() {
  const db = await getBatchData();
  const generalData = db?.general || [];
  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
      <div className="mb-8 border-b border-slate-800 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 animate-fade font-mono">
            <span className="text-green-500">root@campus</span>
            <span className="text-slate-600">:</span>
            <span className="text-cyan-500">~/notices</span>
          </h1>
          <p className="text-slate-500 animate-fade delay-300">
            System announcements and campus updates.
          </p>
        </div>

        <span className="hidden md:inline-block text-xs font-mono text-cyan-500 bg-cyan-950/30 border border-cyan-900/50 px-3 py-1 rounded-full mb-1 animate-fade">
          {generalData.length} items
        </span>
      </div>

      <SectionTabs notices={generalData} />
    </main>
  );
}
