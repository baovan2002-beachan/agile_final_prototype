import { SCHOOLS, type School } from "./schools";
import { CLASSES, LEVELS, type Level } from "./students";

// ASSUMPTION: invented principals, addresses, teachers, rooms, cohort sizes (mock data).
export type SchoolRecord = School & { address: string; principal: string; active: boolean };
const PRINCIPALS = ["Mrs Angela Koh", "Mr Faizal Rahim", "Ms Janet Lau", "Dr Ramesh Nair", "Mrs Wong Mei Ling", "Mr Daniel Ng"];
export const SCHOOL_RECORDS: SchoolRecord[] = SCHOOLS.map((s, i) => ({
  ...s,
  address: `${10 + i * 3} Example Road, Singapore ${560000 + i * 1137}`,
  principal: PRINCIPALS[i % PRINCIPALS.length],
  active: true,
}));

export type LevelRecord = { level: Level; cohort: number; head: string };
const COHORTS = [100, 105, 110, 112, 115, 118, 120, 112, 115, 113]; // sums to 1,120 (Greenfield)
const HEADS = ["Mrs Lim Siew Hoon", "Mr Kumar Raj", "Ms Tan Pei Shan", "Mr Ismail Yusof", "Mrs Chua Lay Cheng", "Mr Brandon Ho", "Ms Nadia Hamid", "Mr Peter Ong", "Mrs Sharon Yeo", "Mr Alan Pang"];
export const LEVEL_RECORDS: LevelRecord[] = LEVELS.map((level, i) => ({ level, cohort: COHORTS[i], head: HEADS[i] }));

export type ClassRecord = { name: string; level: Level; teacher: string; room: string; capacity: number };
const TEACHERS = ["Ms Rina Abdullah", "Mr Jason Tay", "Mrs Grace Lim", "Mr Vikram Menon", "Ms Cheryl Goh", "Mr Hafiz Salleh", "Mrs Anita Raj", "Mr Eric Soh"];
export const CLASS_RECORDS: ClassRecord[] = LEVELS.flatMap((level, i) =>
  CLASSES[level].map((name, j) => ({
    name,
    level,
    teacher: TEACHERS[(i * 2 + j) % TEACHERS.length],
    room: `Block ${"ABC"[i % 3]} ${Math.floor(i / 3) + 1}-0${j + 1}`,
    capacity: 40,
  })),
);
