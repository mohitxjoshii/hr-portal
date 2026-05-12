import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/context/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Moon, Sun, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — HR Portal" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggleTheme, logout } = useAuth();
  const navigate = useNavigate();

  const resetDemo = () => {
    if (typeof window === "undefined") return;
    Object.keys(localStorage).filter((k) => k.startsWith("hrp.")).forEach((k) => localStorage.removeItem(k));
    toast.success("Demo data reset. Reloading…");
    setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Customize your portal experience.</p>
      </div>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Appearance</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <div>
              <Label className="text-sm font-medium">Dark mode</Label>
              <p className="text-xs text-muted-foreground">Use a dark color scheme across the portal.</p>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Toggle label="Leave request updates" desc="Get notified when your leave is approved or rejected." defaultChecked />
          <Toggle label="Onboarding reminders" desc="Reminders to complete onboarding tasks." defaultChecked />
          <Toggle label="Weekly digest" desc="A summary email every Monday." />
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader><CardTitle className="text-base">Account</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Sign out of HR Portal</p>
            <p className="text-xs text-muted-foreground">You'll be returned to the login screen.</p>
          </div>
          <Button variant="outline" onClick={() => { logout(); navigate({ to: "/login" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-soft border-destructive/30">
        <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Reset demo data</p>
            <p className="text-xs text-muted-foreground">Clear all local employees, leaves, and accounts.</p>
          </div>
          <Button variant="outline" className="text-destructive hover:text-destructive" onClick={resetDemo}>
            <Trash2 className="mr-2 h-4 w-4" /> Reset
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
