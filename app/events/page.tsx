import { getBatchData } from "@/lib/googleSheets";
import EventCard from "@/components/EventCard";

export const metadata = {
  title: "Events | Campus_OS",
};

export default async function EventsPage() {
  const db = await getBatchData();
  const events = db?.events || [];

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-white mb-8 border-b border-slate-800 pb-4 animate-fade">
        <span className="text-purple-500">Events</span>_Gallery
      </h1>

      <EventCard data={events} />
    </main>
  );
}
