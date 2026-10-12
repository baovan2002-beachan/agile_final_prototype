import { CLASSES, LEVELS, type Level, type Student, type StudentStatus } from "../../../data/students";

export type Filters = { level: string; class: string; status: string };
export const NO_FILTERS: Filters = { level: "", class: "", status: "" };

/** Empty filter value = "all". */
export function filterStudents(rows: Student[], f: Filters): Student[] {
  return rows.filter(
    (s) => (!f.level || s.level === f.level) && (!f.class || s.class === f.class) && (!f.status || s.status === f.status),
  );
}

function nextId(rows: Student[]): string {
  const max = rows.reduce((m, s) => Math.max(m, Number(s.id.slice(1)) || 0), 0);
  return `S${max + 1}`;
}

export function newStudent(rows: Student[], p: { name: string; level: Level; class: string }): Student {
  // ASSUMPTION: a newly added student starts Active, with an empty Education Account and no SBFAS application.
  return { id: nextId(rows), name: p.name.trim(), level: p.level, class: p.class, status: "Active", balance: 0, sbfas: "Not applied" };
}

export type NewStudentInput = { name: string; dob: string; level: string; class: string };
export type NewStudentErrors = Partial<Record<keyof NewStudentInput, string>>;

// ASSUMPTION: school-age students are 6-16 (account is open from 7 until 16; 6 allowed for early P1 intake).
export function validateNewStudent(v: NewStudentInput, today = new Date()): NewStudentErrors {
  const e: NewStudentErrors = {};
  const name = v.name.trim();
  if (!name) e.name = "Enter the student's full name.";
  else if (name.length < 2 || name.length > 80) e.name = "Name must be 2 to 80 characters.";
  else if (!/^[\p{L}\p{M}' .\-@/]+$/u.test(name)) e.name = "Name can only contain letters, spaces and - ' . / @";

  const dob = new Date(v.dob);
  if (!v.dob || Number.isNaN(dob.getTime())) e.dob = "Enter a date of birth.";
  else if (dob > today) e.dob = "Date of birth cannot be in the future.";
  else {
    let age = today.getFullYear() - dob.getFullYear();
    if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
    if (age < 6 || age > 16) e.dob = `Student age must be 6 to 16 (this date gives ${age}).`;
  }

  if (!LEVELS.includes(v.level as Level)) e.level = "Select a level.";
  if (!v.class) e.class = "Select a class.";
  else if (!e.level && !CLASSES[v.level as Level].includes(v.class)) e.class = "Select a class that belongs to the chosen level.";
  return e;
}

export type CsvRow = { name: string; level: Level; class: string };
export type CsvResult = { error: string } | { rows: CsvRow[]; total: number; skipped: number };

/** Mock CSV parse: header row must contain name, level, class. No quoted-field support (ponytail: use a CSV lib if real files need it). */
export function parseStudentCsv(fileName: string, text: string): CsvResult {
  if (!/\.csv$/i.test(fileName)) return { error: "Please choose a .csv file." };
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { error: "The file is empty." };
  const head = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const [iName, iLevel, iClass] = ["name", "level", "class"].map((c) => head.indexOf(c));
  if (iName < 0 || iLevel < 0 || iClass < 0) return { error: "The header row must contain the columns: name, level, class." };
  const body = lines.slice(1);
  if (body.length === 0) return { error: "The file has a header but no student rows." };
  const rows: CsvRow[] = [];
  for (const l of body) {
    const c = l.split(",").map((x) => x.trim());
    const level = LEVELS.find((lv) => lv.toLowerCase() === (c[iLevel] ?? "").toLowerCase());
    if (c[iName] && level && c[iClass]) rows.push({ name: c[iName], level, class: c[iClass] });
  }
  return { rows, total: body.length, skipped: body.length - rows.length };
}

export const statusTone: Record<StudentStatus, "success" | "warning" | "neutral"> = {
  Active: "success",
  "On leave": "warning",
  Transferred: "neutral",
};
