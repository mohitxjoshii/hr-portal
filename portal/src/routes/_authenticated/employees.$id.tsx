import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { StatusPill } from "@/components/StatusPill";
import { getEmployees, saveEmployees, pushActivity, type Employee } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { format } from "date-fns";

export const Route = createFileRoute("/_authenticated/employees/$id")({
  head: () => ({ meta: [{ title: "Employee — HR Portal" }] }),
  component: EmployeeDetail,
});

const DEPARTMENTS = ["Engineering", "Design", "People Ops", "Sales", "Marketing", "Finance", "Support"];
const STATUSES: Employee["status"][] = ["Active", "On Leave", "Inactive"];

function EmployeeDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const initial = getEmployees().find((e) => e.id === id);
  const [emp, setEmp] = useState<Employee | undefined>(initial);
  const [editing, setEditing] = useState(false);

  if (!emp) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">Employee not found.</p>
        <Button className="mt-4" asChild><Link to="/employees">Back to employees</Link></Button>
      </Card>
    );
  }

  const isHr = user?.role === "hr";
  const canEdit = isHr;

  const save = (ev: React.FormEvent) => {
    ev.preventDefault();
    const all = getEmployees();
    const next = all.map((e) => (e.id === emp.id ? emp : e));
    saveEmployees(next);
    pushActivity(`Updated ${emp.name}'s profile`);
    toast.success("Profile updated");
    setEditing(false);
  };

  const update = <K extends keyof Employee>(k: K, v: Employee[K]) => setEmp({ ...emp, [k]: v });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {isHr && (
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/employees"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to employees</Link>
        </Button>
      )}

      <Card className="overflow-hidden shadow-soft">
        <div className="h-28 bg-gradient-to-r from-primary via-indigo-500 to-violet-500" />
        <CardContent className="-mt-12 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <InitialsAvatar name={emp.name} color={emp.avatarColor} size="lg" className="ring-4 ring-card" />
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">{emp.name}</h1>
                <p className="text-sm text-muted-foreground">{emp.designation} · {emp.department}</p>
                <div className="mt-2 flex items-center gap-2">
                  <StatusPill status={emp.status} />
                  <span className="text-xs font-mono text-muted-foreground">{emp.employeeId}</span>
                </div>
              </div>
            </div>
            {canEdit && !editing && (
              <Button onClick={() => setEditing(true)}>Edit profile</Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!editing ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="text-base">Contact information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Mail} label="Email" value={emp.email} />
              <Row icon={Phone} label="Phone" value={emp.phone} />
              <Row icon={MapPin} label="Address" value={emp.address || "—"} />
            </CardContent>
          </Card>
          <Card className="shadow-soft">
            <CardHeader><CardTitle className="text-base">Employment</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row icon={Building2} label="Department" value={emp.department} />
              <Row icon={BadgeCheck} label="Designation" value={emp.designation} />
              <Row icon={Calendar} label="Joining date" value={format(new Date(emp.joiningDate), "MMMM d, yyyy")} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="shadow-soft">
          <CardHeader><CardTitle className="text-base">Edit details</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Full name"><Input id="name" value={emp.name} onChange={(e) => update("name", e.target.value)} /></Field>
              <Field id="email" label="Email"><Input id="email" type="email" value={emp.email} onChange={(e) => update("email", e.target.value)} /></Field>
              <Field id="phone" label="Phone"><Input id="phone" value={emp.phone} onChange={(e) => update("phone", e.target.value)} /></Field>
              <Field id="department" label="Department">
                <Select value={emp.department} onValueChange={(v) => update("department", v)}>
                  <SelectTrigger id="department"><SelectValue /></SelectTrigger>
                  <SelectContent>{DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field id="designation" label="Designation"><Input id="designation" value={emp.designation} onChange={(e) => update("designation", e.target.value)} /></Field>
              <Field id="status" label="Status">
                <Select value={emp.status} onValueChange={(v) => update("status", v as Employee["status"])}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="address" label="Address">
                  <Textarea id="address" rows={3} value={emp.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setEmp(initial); setEditing(false); }}>Cancel</Button>
                <Button type="submit">Save changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 rounded-md bg-secondary p-1.5"><Icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value}</p>
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
