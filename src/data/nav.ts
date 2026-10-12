import {
  Bank, Buildings, ChalkboardTeacher, ChartBar, ClipboardText, CreditCard, FileText, Gear,
  GraduationCap, HandHeart, House, Receipt, Stack, Tag, UsersThree, Wallet, type Icon,
} from "@phosphor-icons/react";
import type { Role } from "../session";

export type NavItem = { to: string; label: string; icon: Icon; badge?: number; title?: string };

export const homeFor = (role: Role) => (role === "parent" ? "/parent" : "/admin");

// Handoff section 7: C (HQ), B (School), D (Parent).
const HQ: NavItem[] = [
  { to: "/admin", label: "Overview", title: "Dashboard", icon: House },
  { to: "/admin/schools", label: "Schools", icon: Buildings },
  { to: "/admin/budgets", label: "Budget allocation", icon: ChartBar },
  { to: "/admin/classes", label: "Classes", icon: ChalkboardTeacher },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/accounts", label: "Education Accounts", icon: Wallet },
  { to: "/admin/top-up", label: "Top-Up Management", icon: Bank },
  { to: "/admin/fee-types", label: "Fee Types", icon: Tag },
  { to: "/admin/fas", label: "FAS Schemes & Budgets", icon: HandHeart },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardText },
  { to: "/admin/settings", label: "Settings", icon: Gear },
];

const SCHOOL: NavItem[] = [
  { to: "/admin", label: "Overview", title: "Dashboard", icon: House },
  { to: "/admin/levels", label: "Education Levels", icon: Stack },
  { to: "/admin/classes", label: "Classes", icon: ChalkboardTeacher },
  { to: "/admin/students", label: "Students", icon: GraduationCap },
  { to: "/admin/fee-types", label: "Fee Types", icon: Tag },
  // ASSUMPTION: badge count is mock (handoff shows 14).
  { to: "/admin/fas", label: "FAS Applications", icon: HandHeart, badge: 14 },
  { to: "/admin/budgets", label: "Budgets & Stats", icon: ChartBar },
  { to: "/admin/audit", label: "Audit Log", icon: ClipboardText },
  { to: "/admin/settings", label: "Settings", icon: Gear },
];

const PARENT: NavItem[] = [
  { to: "/parent", label: "Overview", icon: House },
  { to: "/parent/students", label: "Students", icon: UsersThree, badge: 2 },
  { to: "/parent/payments", label: "Payments", icon: CreditCard },
  { to: "/parent/transactions", label: "Transactions", icon: Receipt },
  { to: "/parent/fas", label: "Financial Aid (FAS)", icon: HandHeart },
  { to: "/parent/statements", label: "Statements", icon: FileText },
  { to: "/parent/settings", label: "Settings", icon: Gear },
];

export const navFor = (role: Role): NavItem[] => ({ hq: HQ, school: SCHOOL, parent: PARENT })[role];
