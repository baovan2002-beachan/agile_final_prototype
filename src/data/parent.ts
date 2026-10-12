// ASSUMPTION: all mock data for the parent e-Service portal. Single source of truth: Overview, Payments (Task 15) and FAS read from here.
// Dates are ISO yyyy-mm-dd; the mock "today" is 2026-10-12.

export type Invoice = { id: string; childId: string; title: string; amount: number; dueDate: string; status: "unpaid" | "overdue" | "paid" };
export type Child = { id: string; name: string; level: string; school: string; educationBalance: number };
export type Transaction = {
  id: string;
  date: string;
  childId: string;
  description: string;
  /** Signed: positive = credit to the education account or refund, negative = payment. */
  amount: number;
  method: "Education account" | "Card" | "MOE top-up";
  invoiceId?: string;
};

export const children: Child[] = [
  { id: "c1", name: "Ethan Lim", level: "Primary 5", school: "Greenridge Primary School", educationBalance: 0 },
  { id: "c2", name: "Chloe Lim", level: "Secondary 2", school: "Eastbrook Secondary School", educationBalance: 120 },
];

export const invoices: Invoice[] = [
  { id: "INV-2609-014", childId: "c2", title: "Term 3 co-curricular activity fee", amount: 85, dueDate: "2026-09-30", status: "overdue" },
  { id: "INV-2610-021", childId: "c1", title: "Term 4 miscellaneous fees", amount: 28, dueDate: "2026-10-31", status: "unpaid" },
  { id: "INV-2610-022", childId: "c2", title: "Term 4 miscellaneous fees", amount: 54, dueDate: "2026-10-31", status: "unpaid" },
  { id: "INV-2611-005", childId: "c1", title: "Science Centre excursion", amount: 25, dueDate: "2026-11-14", status: "unpaid" },
  { id: "INV-2611-009", childId: "c2", title: "Mathematics Olympiad training", amount: 160, dueDate: "2026-11-20", status: "unpaid" },
  { id: "INV-2601-003", childId: "c1", title: "Term 1 miscellaneous fees", amount: 28, dueDate: "2026-01-31", status: "paid" },
  { id: "INV-2601-004", childId: "c2", title: "Term 1 miscellaneous fees", amount: 54, dueDate: "2026-01-31", status: "paid" },
  { id: "INV-2603-011", childId: "c2", title: "School uniform and PE kit", amount: 96.5, dueDate: "2026-03-15", status: "paid" },
  { id: "INV-2606-008", childId: "c2", title: "Term 2 co-curricular activity fee", amount: 85, dueDate: "2026-06-30", status: "paid" },
  { id: "INV-2607-002", childId: "c1", title: "Learning device instalment (Jul-Sep)", amount: 126, dueDate: "2026-07-31", status: "paid" },
];

/** Newest first. Every paid invoice has a matching payment here (checked in parent.test.ts). */
export const transactions: Transaction[] = [
  { id: "TX-0731-01", date: "2026-07-28", childId: "c1", description: "Learning device instalment (Jul-Sep)", amount: -126, method: "Education account", invoiceId: "INV-2607-002" },
  { id: "TX-0627-01", date: "2026-06-27", childId: "c2", description: "Term 2 co-curricular activity fee", amount: -85, method: "Education account", invoiceId: "INV-2606-008" },
  { id: "TX-0312-01", date: "2026-03-12", childId: "c2", description: "School uniform and PE kit", amount: -96.5, method: "Card", invoiceId: "INV-2603-011" },
  { id: "TX-0129-01", date: "2026-01-29", childId: "c2", description: "Term 1 miscellaneous fees", amount: -54, method: "Education account", invoiceId: "INV-2601-004" },
  { id: "TX-0129-02", date: "2026-01-29", childId: "c1", description: "Term 1 miscellaneous fees", amount: -28, method: "Education account", invoiceId: "INV-2601-003" },
  { id: "TX-0102-01", date: "2026-01-02", childId: "c2", description: "MOE annual top-up", amount: 290, method: "MOE top-up" },
  { id: "TX-0102-02", date: "2026-01-02", childId: "c1", description: "MOE annual top-up", amount: 230, method: "MOE top-up" },
];

export const fasStatus = {
  applicationId: "FAS-2026-0418",
  scheme: "MOE Financial Assistance Scheme (MOEFAS)",
  status: "Under review" as "Under review" | "Approved" | "Not approved",
  submittedOn: "2026-09-18",
  note: "Household income band was synced via SingPass on 18 Sep. A school bursar is reviewing your family application.",
};

export type Fas = typeof fasStatus;

export type Profile = { name: string; nric: string; address: string; mailingAddress: string; contact: string };

export const profile: Profile = {
  name: "Rachel Lim",
  nric: "S****567A",
  address: "Blk 214 Bishan Street 23, #08-112, Singapore 570214",
  mailingAddress: "Blk 214 Bishan Street 23, #08-112, Singapore 570214",
  contact: "+65 9123 4567",
};

export const parentData = { children, invoices, transactions, fasStatus, profile };
