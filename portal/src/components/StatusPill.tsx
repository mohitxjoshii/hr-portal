import { cn } from "@/lib/utils";

type Status = "Active" | "On Leave" | "Inactive" | "Pending" | "Approved" | "Rejected" | string;

const styles: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Approved: "bg-success/10 text-success border-success/20",
  "On Leave": "bg-warning/15 text-warning-foreground border-warning/30",
  Pending: "bg-warning/15 text-amber-700 dark:text-amber-300 border-warning/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}
