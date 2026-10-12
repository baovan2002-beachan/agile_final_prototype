import type { Role } from "../session";

export type User = { name: string; initials: string };
export type StaffAccount = User & { role: "hq" | "school"; title: string; email: string; password: string };

// ASSUMPTION: mock identities and test-only credentials; real auth is out of scope (SingPass and staff SSO are simulated).
export const PARENT: User = { name: "Rachel Lim", initials: "RL" };

export const STAFF: StaffAccount[] = [
  { role: "school", name: "Alicia Tan", initials: "AT", title: "School Admin", email: "alicia.tan@school.example", password: "Sch00l-Demo-26" },
  { role: "hq", name: "Daniel Lim", initials: "DL", title: "MOE HQ Officer", email: "daniel.lim@moe.example", password: "HqOfficer-Demo-26" },
];

/** One mock user per role, so the session can be restored from the role alone. */
export const userFor = (role: Role): User => (role === "parent" ? PARENT : STAFF.find((s) => s.role === role)!);

export const findStaff = (email: string, password: string) =>
  STAFF.find((s) => s.email === email.trim().toLowerCase() && s.password === password);
