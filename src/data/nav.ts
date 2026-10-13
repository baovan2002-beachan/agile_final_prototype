import {
  Bank, Buildings, ChalkboardTeacher, ChartBar, ClipboardText, CreditCard, FileText, Gear,
  GraduationCap, HandHeart, House, Receipt, Stack, Tag, UsersThree, Wallet, type Icon,
} from "@phosphor-icons/react";
import type { Role } from "../session";
import { FAS_APPLICATIONS } from "./fasApplications";
import { children } from "./parent";

const PENDING_FAS = FAS_APPLICATIONS.filter((a) => a.status === "Pending").length;

export type NavItem = { to: string; label: string; icon: Icon; badge?: number; title?: string };

export const homeFor = (role: Role) => (role === "parent" ? "/parent" : "/admin");

// Handoff section 7: C (HQ), B (School), D (Parent).
const HQ: NavItem[] = [
  { to: "/admin", label: "Overview", title: "Dashboard", icon: House },
  { to: "/admin/schools", label: "Schools", icon: Buildings },
  { to: "/admin/school-maintenance", label: "Manage Schools", icon: Gear },
  { to: "/admin/levels", label: "Levels & Cohorts", icon: Stack },
  { to: "/admin/budgets", label: "Budget allocation", icon: ChartBar },
  { to: "/admin/classes", label: "Classes", icon: ChalkboardTeacher },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/accounts", label: "Education Accounts", icon: Wallet },
  { to: "/admin/top-up", label: "Top-Up Management", icon: Bank },
  { to: "/admin/fee-types", label: "Fee Types", icon: Tag },
  { to: "/admin/budgets", label: "FAS Schemes & Budgets", icon: HandHeart },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardText },
  { to: "/admin/settings", label: "Settings", icon: Gear },
];

const SCHOOL: NavItem[] = [
  { to: "/admin", label: "Overview", title: "Dashboard", icon: House },
  { to: "/admin/levels", label: "Education Levels", icon: Stack },
  { to: "/admin/classes", label: "Classes", icon: ChalkboardTeacher },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/fee-types", label: "Fee Types", icon: Tag },
  // Badge = pending items in the review queue at load (the badge does not update as decisions are made in this session).
  { to: "/admin/fas", label: "FAS Applications", icon: HandHeart, badge: PENDING_FAS },
  { to: "/admin/budgets", label: "Budgets & Stats", icon: ChartBar },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardText },
  { to: "/admin/settings", label: "Settings", icon: Gear },
];

const PARENT: NavItem[] = [
  { to: "/parent", label: "Overview", icon: House },
  { to: "/parent/students", label: "Students", icon: UsersThree, badge: children.length },
  { to: "/parent/payments", label: "Payments", icon: CreditCard },
  { to: "/parent/transactions", label: "Transactions", icon: Receipt },
  { to: "/parent/fas", label: "Financial Aid (FAS)", icon: HandHeart },
  { to: "/parent/statements", label: "Statements", icon: FileText },
  { to: "/parent/settings", label: "Settings", icon: Gear },
];

export const navFor = (role: Role): NavItem[] => ({ hq: HQ, school: SCHOOL, parent: PARENT })[role];
