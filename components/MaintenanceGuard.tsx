"use client";

import { usePathname } from "next/navigation";
import MaintenanceView from "@/components/MaintenanceView";

interface MaintenanceGuardProps {
  maintenanceMode: boolean;
  children: React.ReactNode;
}

export default function MaintenanceGuard({
  maintenanceMode,
  children,
}: MaintenanceGuardProps) {
  const pathname = usePathname();

  // Allow login and dashboard routes to run even when maintenance mode is active
  const isAuthRoute =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/api/auth");

  if (maintenanceMode && !isAuthRoute) {
    return <MaintenanceView />;
  }

  return <>{children}</>;
}
