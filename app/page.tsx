import { getBatchData } from '@/lib/googleSheets';
import DashboardHero from '@/components/DashboardHero';
import GridBackground from '@/components/GridBackground';

const HomePage = async() => {
  const db = await getBatchData();
  const generalNews = db?.general || [];
  const latestNotice = generalNews.length > 0 ? generalNews[0] : null; // Latest notice

  return (
    <>
      <GridBackground />
      <main className="flex-1 relative z-10 flex flex-col">
        <DashboardHero latestNotice={latestNotice} />
      </main>
    </>
  );
}

export default HomePage;