import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, FileText, User, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getEmployees, saveEmployees, pushActivity } from "@/lib/storage";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — HR Portal" }] }),
  component: OnboardingPage,
});

const STEPS = [
  { id: 1, title: "Personal", icon: User, desc: "Tell us about you" },
  { id: 2, title: "Documents", icon: FileText, desc: "Upload your IDs" },
  { id: 3, title: "Policies", icon: ShieldCheck, desc: "Review & accept" },
  { id: 4, title: "Done", icon: Sparkles, desc: "You're set!" },
];

function OnboardingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    fullName: user?.name ?? "", dob: "", phone: "", emergency: "", address: "",
    idDoc: "", taxDoc: "", bankDoc: "",
    accept: false,
  });
  const [done, setDone] = useState(false);

  const update = <K extends keyof typeof data>(k: K, v: typeof data[K]) => setData((d) => ({ ...d, [k]: v }));

  const finish = () => {
    if (user?.employeeId) {
      const emps = getEmployees();
      const next = emps.map((e) => e.employeeId === user.employeeId ? { ...e, onboardingComplete: true } : e);
      saveEmployees(next);
      pushActivity(`${user.name} completed onboarding`);
    }
    setDone(true);
    setStep(4);
    toast.success("Onboarding complete!");
  };

  const progress = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Onboarding</h1>
        <p className="text-sm text-muted-foreground">Complete your profile to get started.</p>
      </div>

      {/* Stepper */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            {STEPS.map((s, i) => {
              const active = step === s.id;
              const completed = step > s.id || done;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      completed ? "border-primary bg-primary text-primary-foreground"
                        : active ? "border-primary text-primary bg-primary-soft"
                        : "border-border text-muted-foreground bg-card",
                    )}>
                      {completed ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="hidden text-center sm:block">
                      <p className={cn("text-xs font-medium", active ? "text-foreground" : "text-muted-foreground")}>{s.title}</p>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn("mx-2 h-0.5 flex-1 rounded", step > s.id || done ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary transition-all" style={{ width: `${done ? 100 : progress}%` }} />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Personal details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="fullName" label="Full legal name">
                  <Input id="fullName" value={data.fullName} onChange={(e) => update("fullName", e.target.value)} />
                </Field>
                <Field id="dob" label="Date of birth">
                  <Input id="dob" type="date" value={data.dob} onChange={(e) => update("dob", e.target.value)} />
                </Field>
                <Field id="phone" label="Phone">
                  <Input id="phone" value={data.phone} onChange={(e) => update("phone", e.target.value)} />
                </Field>
                <Field id="emergency" label="Emergency contact">
                  <Input id="emergency" value={data.emergency} onChange={(e) => update("emergency", e.target.value)} />
                </Field>
                <div className="sm:col-span-2">
                  <Field id="address" label="Address">
                    <Textarea id="address" rows={3} value={data.address} onChange={(e) => update("address", e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Upload documents</h2>
              <p className="text-sm text-muted-foreground">Provide reference numbers for your documents (demo).</p>
              <div className="grid gap-4">
                <Field id="idDoc" label="Government-issued ID number">
                  <Input id="idDoc" value={data.idDoc} onChange={(e) => update("idDoc", e.target.value)} />
                </Field>
                <Field id="taxDoc" label="Tax ID / SSN">
                  <Input id="taxDoc" value={data.taxDoc} onChange={(e) => update("taxDoc", e.target.value)} />
                </Field>
                <Field id="bankDoc" label="Bank account (last 4 digits)">
                  <Input id="bankDoc" value={data.bankDoc} onChange={(e) => update("bankDoc", e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Company policies</h2>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
                <p className="mb-2 font-medium text-foreground">Code of Conduct</p>
                <p>By joining Acme Inc., you agree to act with integrity, treat colleagues with respect, and protect company information. You'll comply with our anti-harassment, security, and conflict-of-interest policies. Time-off, remote work, and equipment usage are governed by the Employee Handbook available in the People Portal.</p>
                <p className="mt-3">This is a demo summary — your real workplace policies should be reviewed by HR.</p>
              </div>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={data.accept}
                  onChange={(e) => update("accept", e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-border accent-[var(--primary)]"
                />
                <span>I have read and agree to the company policies and code of conduct.</span>
              </label>
            </div>
          )}

          {step === 4 && (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">You're all set!</h2>
              <p className="mt-1 text-sm text-muted-foreground">Welcome aboard, {data.fullName.split(" ")[0] || "there"}. Your manager will reach out shortly.</p>
            </div>
          )}

          {step < 4 && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep((s) => s + 1)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
              ) : (
                <Button disabled={!data.accept} onClick={finish}>Finish onboarding</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
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
