import { auth } from "@/auth";
import ClientDashboard from "@/components/admin/ClientDashboard";
import { fetchSheets } from "@/lib/adminSheets";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const sheetData = await fetchSheets();

  return (
    <ClientDashboard
      currentUser={session.user.id}
      userName={session.user.name || "SYS_ADMIN"}
      initialData={sheetData}
    />
  );
}
