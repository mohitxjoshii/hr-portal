import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { StatusPill } from "@/components/StatusPill";
import { getEmployees, getLeaves, getActivity } from "@/lib/storage";
import {
  Users, CalendarCheck, UserPlus, TrendingUp, ArrowRight,
  Clock, CheckCircle2, Calendar,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — HR Portal" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuth();
  return user?.role === "hr" ? <HrDashboard /> : <EmployeeDashboard />;
}

function HrDashboard() {
  const employees = getEmployees();
  const leaves = getLeaves();
  const activity = getActivity();

  const stats = [
    { label: "Total Employees", value: employees.length, change: "+3 this month", icon: Users, color: "text-primary bg-primary-soft" },
    { label: "Pending Leaves", value: leaves.filter((l) => l.status === "Pending").length, change: "Needs review", icon: Clock, color: "text-amber-600 bg-amber-100 dark:bg-amber-500/15" },
    { label: "Approved (mo)", value: leaves.filter((l) => l.status === "Approved").length, change: "+12% vs last", icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-500/15" },
    { label: "Onboarding", value: employees.filter((e) => !e.onboardingComplete).length, change: "In progress", icon: UserPlus, color: "text-violet-600 bg-violet-100 dark:bg-violet-500/15" },
  ];

  const headcountData = useMemo(
    () => [
      { m: "Nov", v: 198 }, { m: "Dec", v: 205 }, { m: "Jan", v: 211 },
      { m: "Feb", v: 220 }, { m: "Mar", v: 228 }, { m: "Apr", v: 234 }, { m: "May", v: 240 },
    ],
    [],
  );
  const deptData = useMemo(() => {
    const map = new Map<string, number>();
    employees.forEach((e) => map.set(e.department, (map.get(e.department) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [employees]);
  const leaveByType = useMemo(() => {
    const map = new Map<string, number>();
    leaves.forEach((l) => map.set(l.type, (map.get(l.type) ?? 0) + 1));
    return Array.from(map, ([name, value]) => ({ name, value }));
  }, [leaves]);
  const PIE = ["#2563eb", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b"];

  const recentEmployees = employees.slice(0, 5);
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good day, Priya 👋</h1>
          <p className="text-sm text-muted-foreground">Here's what's happening with your team today.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/leaves">Review leaves</Link>
          </Button>
          <Button asChild>
            <Link to="/employees/add">
              <UserPlus className="mr-2 h-4 w-4" /> Add employee
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-border/70 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">{s.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{s.change}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${s.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Headcount growth</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
              <TrendingUp className="h-3.5 w-3.5" /> +21% YoY
            </span>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={headcountData} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={2.5} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-base">By department</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                    {deptData.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
              {deptData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE[i % PIE.length] }} />
                  <span className="text-muted-foreground truncate">{d.name}</span>
                  <span className="ml-auto font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Pending leave requests</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link to="/leaves">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending requests. You're all caught up! 🎉</p>
            )}
            {pendingLeaves.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-lg border border-border/70 p-3">
                <InitialsAvatar name={l.employeeName} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l.employeeName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {l.type} · {format(new Date(l.startDate), "MMM d")} – {format(new Date(l.endDate), "MMM d")}
                  </p>
                </div>
                <StatusPill status={l.status} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-base">Leaves by type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leaveByType} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent employees</CardTitle>
            <Button asChild variant="ghost" size="sm" className="text-primary">
              <Link to="/employees">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {recentEmployees.map((e) => (
                <Link
                  key={e.id}
                  to="/employees/$id"
                  params={{ id: e.id }}
                  className="flex items-center gap-3 py-3 transition-colors hover:bg-secondary/40 -mx-3 px-3 rounded-lg"
                >
                  <InitialsAvatar name={e.name} color={e.avatarColor} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{e.designation} · {e.department}</p>
                  </div>
                  <StatusPill status={e.status} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent activity</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activity.slice(0, 6).map((a) => (
                <li key={a.id} className="flex gap-3">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-sm leading-snug">{a.message}</p>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.at), { addSuffix: true })}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();
  const employees = getEmployees();
  const me = employees.find((e) => e.employeeId === user?.employeeId) ?? employees[0];
  const leaves = getLeaves().filter((l) => l.employeeId === me?.employeeId);

  const attendance = useMemo(
    () => [
      { d: "Mon", h: 8 }, { d: "Tue", h: 8.2 }, { d: "Wed", h: 7.8 },
      { d: "Thu", h: 8.5 }, { d: "Fri", h: 7.5 }, { d: "Sat", h: 0 }, { d: "Sun", h: 0 },
    ],
    [],
  );

  const balances = [
    { label: "Annual", used: 6, total: 20, color: "bg-primary" },
    { label: "Sick", used: 2, total: 10, color: "bg-emerald-500" },
    { label: "Casual", used: 3, total: 8, color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">Here's a snapshot of your work week.</p>
        </div>
        <Button asChild>
          <Link to="/leaves"><Calendar className="mr-2 h-4 w-4" /> Apply for leave</Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <InitialsAvatar name={me?.name ?? user!.name} color={me?.avatarColor} size="lg" />
              <div>
                <h2 className="text-lg font-semibold">{me?.name ?? user?.name}</h2>
                <p className="text-sm text-muted-foreground">{me?.designation} · {me?.department}</p>
                <div className="mt-1.5"><StatusPill status={me?.status ?? "Active"} /></div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <Stat label="Employee ID" value={me?.employeeId ?? "—"} />
              <Stat label="Joining date" value={me ? format(new Date(me.joiningDate), "MMM d, yyyy") : "—"} />
              <Stat label="Email" value={me?.email ?? user?.email ?? "—"} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-base">Leave balance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {balances.map((b) => {
              const pct = Math.round((b.used / b.total) * 100);
              return (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{b.label}</span>
                    <span className="text-muted-foreground">{b.used} / {b.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full ${b.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="shadow-soft lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">This week's hours</CardTitle></CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendance} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="h" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2"><CardTitle className="text-base">Announcements</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="rounded-lg border border-border/70 p-3">
                <p className="font-medium">All-hands on Friday</p>
                <p className="text-muted-foreground">Quarterly review at 4pm in the main hall.</p>
              </li>
              <li className="rounded-lg border border-border/70 p-3">
                <p className="font-medium">New benefits portal</p>
                <p className="text-muted-foreground">Check your updated health plan options.</p>
              </li>
              <li className="rounded-lg border border-border/70 p-3">
                <p className="font-medium">Office closure</p>
                <p className="text-muted-foreground">Memorial Day, May 25.</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">My recent leaves</CardTitle>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/leaves">View all <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {leaves.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leave requests yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {leaves.slice(0, 5).map((l) => (
                <div key={l.id} className="flex items-center gap-3 py-3">
                  <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{l.type} leave</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(l.startDate), "MMM d")} – {format(new Date(l.endDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <StatusPill status={l.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-secondary/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
