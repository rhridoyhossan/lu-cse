import { getBatchData } from '@/lib/googleSheets';
import SectionTabs from '@/components/SectionTabs';

export const metadata = {
  title: 'Notices | Campus_OS',
};

export default async function NoticesPage() {
  const db = await getBatchData();
  
  const generalData = db?.general || [];
  const sectionsData = db?.sections || {};

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12">
        <div className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2 animate-fade">
            <span className="text-cyan-500">/var/log</span>/notices
          </h1>
          <p className="text-slate-500 animate-fade delay-300">
            Select a data stream from the sidebar to view logs.
          </p>
        </div>

        <SectionTabs sections={sectionsData} general={generalData} />
      </main>
  );
}