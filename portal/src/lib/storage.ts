// LocalStorage-backed data layer for the HR Portal demo

export type Role = "hr" | "employee";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only
  role: Role;
  employeeId?: string; // links to employee record
}

export interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joiningDate: string;
  phone: string;
  address: string;
  status: "Active" | "On Leave" | "Inactive";
  avatarColor: string;
  onboardingComplete: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Casual" | "Sick" | "Annual" | "Unpaid";
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedAt: string;
}

export interface Activity {
  id: string;
  message: string;
  at: string;
}

const KEYS = {
  users: "hrp.users",
  employees: "hrp.employees",
  leaves: "hrp.leaves",
  activity: "hrp.activity",
  session: "hrp.session",
  theme: "hrp.theme",
};

const COLORS = ["#2563eb", "#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];
const pickColor = (i: number) => COLORS[i % COLORS.length];

export const uid = () => Math.random().toString(36).slice(2, 10);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
}

export function seed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEYS.users)) return;

  const employees: Employee[] = [
    { id: uid(), employeeId: "EMP-001", name: "Rohit bhardwaj", email: "rohit@acme.co", department: "Engineering", designation: "Senior Engineer", joiningDate: "2022-03-14", phone: "+1 555 102 3344", address: "221B Baker St, NY", status: "Active", avatarColor: pickColor(0), onboardingComplete: true },
    { id: uid(), employeeId: "EMP-002", name: "Marcus Chen", email: "marcus@acme.co", department: "Design", designation: "Product Designer", joiningDate: "2023-07-01", phone: "+1 555 871 2210", address: "55 Market St, SF", status: "Active", avatarColor: pickColor(1), onboardingComplete: true },
    { id: uid(), employeeId: "EMP-003", name: "Mohit joshi", email: "mohit@acme.co", department: "People Ops", designation: "HR Specialist", joiningDate: "2021-11-20", phone: "+1 555 332 9087", address: "9 Howard St, Boston", status: "Active", avatarColor: pickColor(2), onboardingComplete: true },
    { id: uid(), employeeId: "EMP-004", name: "Diego Alvarez", email: "diego@acme.co", department: "Sales", designation: "Account Executive", joiningDate: "2024-02-05", phone: "+1 555 712 4480", address: "401 Brickell, Miami", status: "On Leave", avatarColor: pickColor(3), onboardingComplete: true },
    { id: uid(), employeeId: "EMP-005", name: "Hana Suzuki", email: "hana@acme.co", department: "Engineering", designation: "Frontend Engineer", joiningDate: "2024-09-18", phone: "+1 555 998 1100", address: "12 Pine Ave, Seattle", status: "Active", avatarColor: pickColor(4), onboardingComplete: false },
    { id: uid(), employeeId: "EMP-006", name: "Liam O'Connor", email: "liam@acme.co", department: "Marketing", designation: "Content Lead", joiningDate: "2023-05-22", phone: "+1 555 220 7763", address: "76 King St, Toronto", status: "Active", avatarColor: pickColor(5), onboardingComplete: true },
  ];

  const users: User[] = [
    { id: uid(), name: "Mohit joshi", email: "hr@acme.co", password: "hr12345", role: "hr", employeeId: employees[2].employeeId },
    { id: uid(), name: "Rohit bhardwaj", email: "employee@acme.co", password: "emp12345", role: "employee", employeeId: employees[0].employeeId },
  ];

  const leaves: LeaveRequest[] = [
    { id: uid(), employeeId: "EMP-004", employeeName: "Diego Alvarez", type: "Annual", startDate: "2026-05-10", endDate: "2026-05-17", reason: "Family vacation", status: "Approved", appliedAt: "2026-04-20" },
    { id: uid(), employeeId: "EMP-001", employeeName: "Rohit bhardwaj", type: "Sick", startDate: "2026-05-13", endDate: "2026-05-14", reason: "Flu recovery", status: "Pending", appliedAt: "2026-05-12" },
    { id: uid(), employeeId: "EMP-006", employeeName: "Liam O'Connor", type: "Casual", startDate: "2026-05-20", endDate: "2026-05-20", reason: "Personal errand", status: "Pending", appliedAt: "2026-05-11" },
    { id: uid(), employeeId: "EMP-002", employeeName: "Marcus Chen", type: "Annual", startDate: "2026-04-01", endDate: "2026-04-05", reason: "Honeymoon", status: "Approved", appliedAt: "2026-03-15" },
  ];

  const activity: Activity[] = [
    { id: uid(), message: "Diego Alvarez's annual leave was approved", at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    { id: uid(), message: "Hana Suzuki started onboarding", at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
    { id: uid(), message: "New employee Liam O'Connor joined Marketing", at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
    { id: uid(), message: "Rohit bhardwaj submitted a sick leave request", at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString() },
  ];

  write(KEYS.users, users);
  write(KEYS.employees, employees);
  write(KEYS.leaves, leaves);
  write(KEYS.activity, activity);
}

// Users
export const getUsers = () => read<User[]>(KEYS.users, []);
export const saveUsers = (u: User[]) => write(KEYS.users, u);

// Employees
export const getEmployees = () => read<Employee[]>(KEYS.employees, []);
export const saveEmployees = (e: Employee[]) => write(KEYS.employees, e);

// Leaves
export const getLeaves = () => read<LeaveRequest[]>(KEYS.leaves, []);
export const saveLeaves = (l: LeaveRequest[]) => write(KEYS.leaves, l);

// Activity
export const getActivity = () => read<Activity[]>(KEYS.activity, []);
export const pushActivity = (message: string) => {
  const a = getActivity();
  a.unshift({ id: uid(), message, at: new Date().toISOString() });
  write(KEYS.activity, a.slice(0, 30));
};

// Session
export const getSession = () => read<User | null>(KEYS.session, null);
export const setSession = (u: User | null) => write(KEYS.session, u);

// Theme
export const getTheme = (): "light" | "dark" => read(KEYS.theme, "light");
export const setTheme = (t: "light" | "dark") => write(KEYS.theme, t);

export const NEW_EMPLOYEE_COLOR = () => pickColor(Math.floor(Math.random() * COLORS.length));
