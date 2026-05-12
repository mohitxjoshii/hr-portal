import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { StatusPill } from "@/components/StatusPill";
import {
  getLeaves, saveLeaves, getEmployees, pushActivity, uid, type LeaveRequest,
} from "@/lib/storage";
import { toast } from "sonner";
import { format, differenceInCalendarDays } from "date-fns";

export const Route = createFileRoute("/_authenticated/leaves")({
  head: () => ({ meta: [{ title: "Leave Requests — HR Portal" }] }),
  component: LeavesPage,
});

const TYPES: LeaveRequest["type"][] = ["Casual", "Sick", "Annual", "Unpaid"];

function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => getLeaves());
  const [openApply, setOpenApply] = useState(false);
  const isHr = user?.role === "hr";

  const myEmployeeId = user?.employeeId;
  const visible = useMemo(
    () => (isHr ? leaves : leaves.filter((l) => l.employeeId === myEmployeeId)),
    [leaves, isHr, myEmployeeId],
  );

  const setStatus = (id: string, status: LeaveRequest["status"]) => {
    const next = leaves.map((l) => (l.id === id ? { ...l, status } : l));
    setLeaves(next); saveLeaves(next);
    const l = next.find((x) => x.id === id);
    if (l) pushActivity(`${l.employeeName}'s ${l.type.toLowerCase()} leave was ${status.toLowerCase()}`);
    toast.success(`Request ${status.toLowerCase()}`);
  };

  const pending = visible.filter((l) => l.status === "Pending");
  const history = visible.filter((l) => l.status !== "Pending");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{isHr ? "Leave requests" : "My leave requests"}</h1>
          <p className="text-sm text-muted-foreground">
            {isHr ? "Approve or decline employee time off requests." : "Apply for time off and track your history."}
          </p>
        </div>
        {!isHr && (
          <Dialog open={openApply} onOpenChange={setOpenApply}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Apply for leave</Button>
            </DialogTrigger>
            <ApplyLeaveDialog
              onSubmit={(req) => {
                const next = [req, ...leaves];
                setLeaves(next); saveLeaves(next);
                pushActivity(`${req.employeeName} applied for ${req.type.toLowerCase()} leave`);
                toast.success("Leave request submitted");
                setOpenApply(false);
              }}
            />
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Pending" value={visible.filter((l) => l.status === "Pending").length} tone="warning" />
        <Stat label="Approved" value={visible.filter((l) => l.status === "Approved").length} tone="success" />
        <Stat label="Rejected" value={visible.filter((l) => l.status === "Rejected").length} tone="destructive" />
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <Tabs defaultValue="pending" className="w-full">
            <div className="border-b border-border px-4 pt-4">
              <TabsList>
                <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                <TabsTrigger value="history">History ({history.length})</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="pending" className="m-0">
              <LeaveTable items={pending} isHr={isHr} onApprove={(id) => setStatus(id, "Approved")} onReject={(id) => setStatus(id, "Rejected")} emptyMsg="Nothing pending. 🎉" />
            </TabsContent>
            <TabsContent value="history" className="m-0">
              <LeaveTable items={history} isHr={isHr} emptyMsg="No history yet." />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "warning" | "success" | "destructive" }) {
  const map: Record<string, string> = {
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    destructive: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  };
  return (
    <Card className="shadow-soft">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className={`rounded-lg px-3 py-1.5 text-xs font-medium ${map[tone]}`}>{label}</div>
      </CardContent>
    </Card>
  );
}

function LeaveTable({
  items, isHr, onApprove, onReject, emptyMsg,
}: {
  items: LeaveRequest[]; isHr: boolean;
  onApprove?: (id: string) => void; onReject?: (id: string) => void;
  emptyMsg: string;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {isHr && <TableHead>Employee</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="hidden md:table-cell">Days</TableHead>
            <TableHead className="hidden lg:table-cell">Reason</TableHead>
            <TableHead>Status</TableHead>
            {isHr && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={isHr ? 7 : 5} className="py-12 text-center text-sm text-muted-foreground">
                {emptyMsg}
              </TableCell>
            </TableRow>
          )}
          {items.map((l) => {
            const days = differenceInCalendarDays(new Date(l.endDate), new Date(l.startDate)) + 1;
            return (
              <TableRow key={l.id}>
                {isHr && (
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={l.employeeName} size="sm" />
                      <span className="font-medium">{l.employeeName}</span>
                    </div>
                  </TableCell>
                )}
                <TableCell>{l.type}</TableCell>
                <TableCell className="text-sm">
                  {format(new Date(l.startDate), "MMM d")} – {format(new Date(l.endDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="hidden md:table-cell">{days}</TableCell>
                <TableCell className="hidden lg:table-cell max-w-xs truncate text-muted-foreground">{l.reason}</TableCell>
                <TableCell><StatusPill status={l.status} /></TableCell>
                {isHr && (
                  <TableCell className="text-right">
                    {l.status === "Pending" && (
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline" onClick={() => onReject?.(l.id)}>
                          <X className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                        <Button size="sm" onClick={() => onApprove?.(l.id)}>
                          <Check className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                      </div>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function ApplyLeaveDialog({ onSubmit }: { onSubmit: (req: LeaveRequest) => void }) {
  const { user } = useAuth();
  const me = getEmployees().find((e) => e.employeeId === user?.employeeId);
  const [type, setType] = useState<LeaveRequest["type"]>("Casual");
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!reason.trim()) { setError("Please add a reason"); return; }
    if (new Date(end) < new Date(start)) { setError("End date must be after start date"); return; }
    onSubmit({
      id: uid(), employeeId: user?.employeeId ?? "EMP-XXX",
      employeeName: me?.name ?? user?.name ?? "Employee",
      type, startDate: start, endDate: end, reason: reason.trim(),
      status: "Pending", appliedAt: new Date().toISOString(),
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Apply for leave</DialogTitle>
        <DialogDescription>Submit a request for HR approval.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as LeaveRequest["type"])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start">Start date</Label>
            <Input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end">End date</Label>
            <Input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">Reason</Label>
          <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Briefly explain…" />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <DialogFooter>
          <Button type="submit">Submit request</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
