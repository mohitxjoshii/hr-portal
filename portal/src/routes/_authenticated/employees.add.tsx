import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getEmployees, saveEmployees, pushActivity, uid, NEW_EMPLOYEE_COLOR, type Employee } from "@/lib/storage";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

export const Route = createFileRoute("/_authenticated/employees/add")({
  head: () => ({ meta: [{ title: "Add Employee — HR Portal" }] }),
  component: AddEmployee,
});

const DEPARTMENTS = ["Engineering", "Design", "People Ops", "Sales", "Marketing", "Finance", "Support"];
const STATUSES: Employee["status"][] = ["Active", "On Leave", "Inactive"];

function AddEmployee() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", employeeId: `EMP-${Math.floor(100 + Math.random() * 900)}`, email: "",
    department: "Engineering", designation: "", joiningDate: new Date().toISOString().slice(0, 10),
    phone: "", address: "", status: "Active" as Employee["status"],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (user?.role !== "hr") {
    return <Card className="p-8 text-center">Only HR admins can add employees.</Card>;
  }

  const update = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.employeeId.trim()) e.employeeId = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.designation.trim()) e.designation = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const employees = getEmployees();
    if (employees.some((x) => x.employeeId === form.employeeId)) {
      setErrors({ employeeId: "ID already exists" });
      return;
    }
    const newEmp: Employee = {
      id: uid(), avatarColor: NEW_EMPLOYEE_COLOR(), onboardingComplete: false, ...form,
    };
    saveEmployees([newEmp, ...employees]);
    pushActivity(`Added new employee ${newEmp.name}`);
    toast.success(`${newEmp.name} added to ${newEmp.department}`);
    navigate({ to: "/employees" });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/employees"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to employees</Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add a new employee</h1>
        <p className="text-sm text-muted-foreground">Fill in the details below. They'll appear in your directory immediately.</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Employee details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
            <Field label="Full name" id="name" error={errors.name}>
              <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jane Doe" />
            </Field>
            <Field label="Employee ID" id="employeeId" error={errors.employeeId}>
              <Input id="employeeId" value={form.employeeId} onChange={(e) => update("employeeId", e.target.value)} />
            </Field>
            <Field label="Email" id="email" error={errors.email}>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jane@acme.co" />
            </Field>
            <Field label="Phone" id="phone" error={errors.phone}>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 …" />
            </Field>
            <Field label="Department" id="department">
              <Select value={form.department} onValueChange={(v) => update("department", v)}>
                <SelectTrigger id="department"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Designation" id="designation" error={errors.designation}>
              <Input id="designation" value={form.designation} onChange={(e) => update("designation", e.target.value)} placeholder="Software Engineer" />
            </Field>
            <Field label="Joining date" id="joiningDate">
              <Input id="joiningDate" type="date" value={form.joiningDate} onChange={(e) => update("joiningDate", e.target.value)} />
            </Field>
            <Field label="Status" id="status">
              <Select value={form.status} onValueChange={(v) => update("status", v as Employee["status"])}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Address" id="address">
                <Textarea id="address" value={form.address} onChange={(e) => update("address", e.target.value)} rows={3} />
              </Field>
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/employees" })}>Cancel</Button>
              <Button type="submit">Add employee</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
