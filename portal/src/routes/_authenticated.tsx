import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { DashboardShell } from "@/components/DashboardShell";
import { PageSpinner } from "@/components/PageSpinner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading || !user) return <PageSpinner />;

  return (
    <DashboardShell>
      <Outlet />
    </DashboardShell>
  );
}
