import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil, Filter } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { StatusPill } from "@/components/StatusPill";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getEmployees, saveEmployees, pushActivity, type Employee } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/employees")({
  head: () => ({ meta: [{ title: "Employees — HR Portal" }] }),
  component: EmployeesPage,
});

const PAGE_SIZE = 6;

function EmployeesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>(() => getEmployees());
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<Employee | null>(null);

  if (user?.role !== "hr") {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-lg font-semibold">Restricted</h2>
        <p className="mt-1 text-sm text-muted-foreground">Only HR admins can view this page.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/dashboard" })}>Back to dashboard</Button>
      </Card>
    );
  }

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department))).sort(),
    [employees],
  );

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const m = query.trim().toLowerCase();
      const matchQ = !m
        || e.name.toLowerCase().includes(m)
        || e.email.toLowerCase().includes(m)
        || e.employeeId.toLowerCase().includes(m)
        || e.designation.toLowerCase().includes(m);
      const matchD = dept === "all" || e.department === dept;
      return matchQ && matchD;
    });
  }, [employees, query, dept]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const confirmDelete = () => {
    if (!toDelete) return;
    const next = employees.filter((e) => e.id !== toDelete.id);
    setEmployees(next);
    saveEmployees(next);
    pushActivity(`Removed employee ${toDelete.name}`);
    toast.success(`${toDelete.name} removed`);
    setToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} {filtered.length === 1 ? "person" : "people"} found</p>
        </div>
        <Button asChild>
          <Link to="/employees/add"><Plus className="mr-2 h-4 w-4" /> Add employee</Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-soft">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="Search by name, email, ID…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={dept} onValueChange={(v) => { setDept(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="hidden md:table-cell">ID</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead className="hidden lg:table-cell">Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No employees match your filters.
                  </TableCell>
                </TableRow>
              )}
              {pageItems.map((e) => (
                <TableRow key={e.id} className="hover:bg-secondary/40">
                  <TableCell>
                    <Link to="/employees/$id" params={{ id: e.id }} className="flex items-center gap-3">
                      <InitialsAvatar name={e.name} color={e.avatarColor} />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{e.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell font-mono text-xs">{e.employeeId}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.department}</TableCell>
                  <TableCell className="hidden lg:table-cell">{e.designation}</TableCell>
                  <TableCell><StatusPill status={e.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button asChild size="icon" variant="ghost" aria-label="Edit">
                        <Link to="/employees/$id" params={{ id: e.id }}><Pencil className="h-4 w-4" /></Link>
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => setToDelete(e)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4 text-sm">
            <p className="text-muted-foreground">Page {safePage} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={safePage === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={safePage === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete?.name} will be permanently removed from your records. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
