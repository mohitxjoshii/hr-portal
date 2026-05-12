import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth";
import { PageSpinner } from "@/components/PageSpinner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
