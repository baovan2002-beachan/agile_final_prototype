// Mirrors the shapes owned by src/data/parent.ts (Task 14); reconcile at merge.
export type Invoice = { id: string; childId: string; title: string; amount: number; dueDate: string; status: "unpaid" | "overdue" | "paid" };
export type Child = { id: string; name: string; level: string; school: string; educationBalance: number };
