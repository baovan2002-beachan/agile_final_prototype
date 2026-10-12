import { describe, expect, it } from "vitest";
import { STUDENTS } from "../../../data/students";
import { filterStudents, newStudent, NO_FILTERS, parseStudentCsv, validateNewStudent } from "./logic";

const today = new Date("2026-10-12");
const ok = { name: "Tan Wei Jie", dob: "2017-03-05", level: "P3", class: "P3 Care" };

describe("filterStudents", () => {
  it("returns everything with no filters", () => {
    expect(filterStudents(STUDENTS, NO_FILTERS)).toHaveLength(STUDENTS.length);
  });
  it("combines filters with AND", () => {
    const r = filterStudents(STUDENTS, { level: "P1", class: "", status: "Active" });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((s) => s.level === "P1" && s.status === "Active")).toBe(true);
  });
  it("a combination that matches nothing gives 0 rows", () => {
    expect(filterStudents(STUDENTS, { level: "P1", class: "", status: "Transferred" })).toHaveLength(0);
  });
});

describe("validateNewStudent", () => {
  it("accepts valid input", () => expect(validateNewStudent(ok, today)).toEqual({}));
  it("flags empty fields", () => {
    const e = validateNewStudent({ name: " ", dob: "", level: "", class: "" }, today);
    expect(Object.keys(e).sort()).toEqual(["class", "dob", "level", "name"]);
  });
  it("rejects digits in name, future dob and out-of-range age", () => {
    expect(validateNewStudent({ ...ok, name: "Tan 123" }, today).name).toBeTruthy();
    expect(validateNewStudent({ ...ok, dob: "2027-01-01" }, today).dob).toMatch(/future/);
    expect(validateNewStudent({ ...ok, dob: "2005-01-01" }, today).dob).toMatch(/6 to 16/);
  });
  it("rejects a class from another level", () => {
    expect(validateNewStudent({ ...ok, class: "P1 Courage" }, today).class).toBeTruthy();
  });
});

describe("parseStudentCsv", () => {
  const csv = "name,level,class\nAmy Lim,P1,P1 Courage\nBen Tan,sec 2,Sec 2 Aspire\nBad Row,P9,X\n";
  it("parses rows, counts total and skipped", () => {
    const r = parseStudentCsv("s.csv", csv);
    expect(r).toMatchObject({ total: 3, skipped: 1 });
    expect("rows" in r && r.rows.map((x) => x.level)).toEqual(["P1", "Sec 2"]);
  });
  it("rejects non-csv and empty files", () => {
    expect(parseStudentCsv("s.txt", csv)).toHaveProperty("error");
    expect(parseStudentCsv("s.csv", "  \n")).toEqual({ error: "The file is empty." });
  });
  it("rejects missing columns and header-only", () => {
    expect(parseStudentCsv("s.csv", "a,b\n1,2")).toHaveProperty("error");
    expect(parseStudentCsv("s.csv", "name,level,class\n")).toHaveProperty("error");
  });
});

describe("newStudent", () => {
  it("gets the next id and defaults", () => {
    const s = newStudent(STUDENTS, { name: " Zed ", level: "P1", class: "P1 Courage" });
    expect(s).toMatchObject({ name: "Zed", balance: 0, status: "Active", sbfas: "Not applied" });
    expect(STUDENTS.some((x) => x.id === s.id)).toBe(false);
  });
});
