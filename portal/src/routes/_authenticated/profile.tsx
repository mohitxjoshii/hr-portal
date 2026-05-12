import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InitialsAvatar } from "@/components/InitialsAvatar";
import { StatusPill } from "@/components/StatusPill";
import { getEmployees, saveEmployees, getUsers, saveUsers, setSession } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — HR Portal" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const employees = getEmployees();
  const me = employees.find((e) => e.employeeId === user?.employeeId);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(me?.phone ?? "");
  const [address, setAddress] = useState(me?.address ?? "");

  const save = (ev: React.FormEvent) => {
    ev.preventDefault();
    // Update user
    if (user) {
      const users = getUsers();
      const updatedUser = { ...user, name, email };
      saveUsers(users.map((u) => (u.id === user.id ? updatedUser : u)));
      setSession(updatedUser);
    }
    // Update employee record
    if (me) {
      const next = employees.map((e) => e.id === me.id ? { ...e, name, email, phone, address } : e);
      saveEmployees(next);
    }
    toast.success("Profile updated. Refresh to see changes everywhere.");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information.</p>
      </div>

      <Card className="shadow-soft">
        <CardContent className="flex items-center gap-4 p-6">
          <InitialsAvatar name={name || user!.name} color={me?.avatarColor} size="lg" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{name || user?.name}</h2>
            <p className="text-sm text-muted-foreground">{me?.designation ?? "—"} {me?.department && `· ${me.department}`}</p>
            <div className="mt-2 flex items-center gap-2">
              <StatusPill status={me?.status ?? "Active"} />
              <span className="text-xs text-muted-foreground capitalize">{user?.role === "hr" ? "HR Admin" : "Employee"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Personal information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="addr">Address</Label>
              <Input id="addr" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
