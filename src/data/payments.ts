import type { Child, Invoice } from "../features/eservice/payments/types";

// Mock fixtures. Emma has a balance, Ethan's Education Account is empty (covers the balance 0 case).
export const children: Child[] = [
  { id: "c1", name: "Emma Mitchell", level: "Primary 4", school: "Greenview Primary School", educationBalance: 184.5 },
  { id: "c2", name: "Ethan Mitchell", level: "Secondary 2", school: "Riverside Secondary School", educationBalance: 0 },
];

export const invoices: Invoice[] = [
  { id: "INV-2041", childId: "c1", title: "Term 4 miscellaneous fees", amount: 42, dueDate: "2026-10-31", status: "unpaid" },
  { id: "INV-2038", childId: "c1", title: "CCA and school camp", amount: 65, dueDate: "2026-09-30", status: "overdue" },
  { id: "INV-2044", childId: "c1", title: "Learning device instalment (Oct)", amount: 38.4, dueDate: "2026-10-25", status: "unpaid" },
  { id: "INV-2046", childId: "c2", title: "Term 4 standard fees", amount: 15, dueDate: "2026-10-31", status: "unpaid" },
  { id: "INV-2039", childId: "c2", title: "National examination fees", amount: 87, dueDate: "2026-09-28", status: "overdue" },
  { id: "INV-2047", childId: "c2", title: "Term 4 miscellaneous fees", amount: 31.5, dueDate: "2026-11-06", status: "unpaid" },
  { id: "INV-2012", childId: "c1", title: "Term 3 miscellaneous fees", amount: 42, dueDate: "2026-07-31", status: "paid" },
];
