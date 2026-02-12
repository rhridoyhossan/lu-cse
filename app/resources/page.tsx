import { getBatchData } from '@/lib/googleSheets';
import ResourceGrid from '@/components/ResourceGrid';

export const metadata = {
  title: 'Resources | Campus_OS',
};

export default async function ResourcesPage() {
  const db = await getBatchData();
  const resources = db?.resources || [];

  return (
    <div className="flex-1 selection:bg-cyan-500/30">
      <ResourceGrid initialData={resources} />
    </div>
  );
}